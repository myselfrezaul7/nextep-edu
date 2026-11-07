import { supabaseAdmin } from "@/lib/supabase-server";
import {
    DEFAULT_STEPS,
    type Application,
    type ApplicationStep,
    type DocumentReviewMeta,
    type UploadedDocumentInfo,
} from "@/lib/supabase";

// Per-trackingCode serialization queue to prevent concurrent read-modify-write races on document_reviews
const metadataLocks = new Map<string, Promise<unknown>>();

async function withMetadataLock<T>(
    key: string,
    fn: () => Promise<T>
): Promise<T> {
    const previous = metadataLocks.get(key) ?? Promise.resolve();
    const next = previous.catch(() => undefined).then(fn);
    metadataLocks.set(key, next);
    try {
        return await next;
    } finally {
        if (metadataLocks.get(key) === next) {
            metadataLocks.delete(key);
        }
    }
}

/**
 * Non-blocking helper to send a broadcast event to a Supabase Realtime channel via HTTP.
 */
export async function broadcastToChannel(
    channelName: string,
    event: string,
    payload: Record<string, unknown>
): Promise<void> {
    try {
        const channel = supabaseAdmin.channel(channelName);
        await channel.httpSend(event, payload);
        supabaseAdmin.removeChannel(channel);
    } catch (err) {
        console.error(`Realtime broadcast error [${channelName}:${event}]:`, err);
    }
}

/**
 * Broadcasts application lifecycle events to both `track:${tracking_code}` and `admin:live`.
 */
export async function broadcastApplicationEvent(
    event: "application-created" | "application-updated" | "application-deleted",
    application: Partial<Application> & { id: string; tracking_code?: string }
): Promise<void> {
    const timestamp = new Date().toISOString();
    const tasks: Promise<void>[] = [];

    if (application.tracking_code) {
        const trackEvent =
            event === "application-deleted"
                ? "application-deleted"
                : "application-updated";
        tasks.push(
            broadcastToChannel(
                `track:${application.tracking_code}`,
                trackEvent,
                application as unknown as Record<string, unknown>
            )
        );
    }

    tasks.push(
        broadcastToChannel("admin:live", event, {
            application,
            timestamp,
        })
    );

    await Promise.allSettled(tasks);
}

/**
 * Extracts document review metadata map stored inside the application's notes JSONB array.
 */
export function extractDocumentReviews(
    notes: ApplicationStep[] | undefined | null
): Record<string, DocumentReviewMeta> {
    if (!Array.isArray(notes)) return {};
    const merged: Record<string, DocumentReviewMeta> = {};
    for (const step of notes) {
        if (step && step.document_reviews && typeof step.document_reviews === "object") {
            Object.assign(merged, step.document_reviews);
        }
    }
    return merged;
}

/**
 * Lists documents for a tracking code from Supabase Storage and enriches them with verification metadata.
 */
export async function getApplicationDocumentsWithMeta(
    trackingCode: string,
    includeSignedUrls = false
): Promise<UploadedDocumentInfo[]> {
    const cleanCode = trackingCode.trim().toUpperCase();

    const [{ data: appRow }, { data: files, error: storageError }] = await Promise.all([
        supabaseAdmin
            .from("applications")
            .select("notes")
            .eq("tracking_code", cleanCode)
            .maybeSingle(),
        supabaseAdmin.storage.from("documents").list(cleanCode),
    ]);

    if (storageError || !files) {
        if (storageError) {
            console.error("Storage list error:", storageError);
        }
        return [];
    }

    const reviewMap = extractDocumentReviews(appRow?.notes as ApplicationStep[] | undefined);
    const validFiles = files.filter(
        (f) => f.name && f.name !== ".emptyFolderPlaceholder"
    );

    const enriched = await Promise.all(
        validFiles.map(async (file) => {
            const meta = reviewMap[file.name];
            let signedUrl: string | null = null;

            if (includeSignedUrls) {
                const { data: urlData, error: urlError } = await supabaseAdmin.storage
                    .from("documents")
                    .createSignedUrl(`${cleanCode}/${file.name}`, 60 * 60, {
                        download: true,
                    });
                if (!urlError && urlData?.signedUrl) {
                    signedUrl = urlData.signedUrl;
                }
            }

            return {
                name: file.name,
                id: file.id || file.name,
                created_at: file.created_at || new Date().toISOString(),
                url: signedUrl,
                status: meta?.status || "pending",
                feedback: meta?.feedback || "",
                originalName: meta?.originalName || file.name,
                updated_at:
                    meta?.updated_at || file.created_at || new Date().toISOString(),
            } satisfies UploadedDocumentInfo;
        })
    );

    return enriched;
}

/**
 * Updates or removes document verification metadata in the application's notes JSONB array.
 * Preserves `applications.updated_at` so student document uploads do not cause false 409
 * optimistic lock conflicts when counselors advance or edit the application in `/admin`.
 */
export async function updateDocumentReviewMeta(
    trackingCode: string,
    fileName: string,
    update: Partial<DocumentReviewMeta> | null
): Promise<Application | null> {
    const cleanCode = trackingCode.trim().toUpperCase();

    return withMetadataLock(cleanCode, async () => {
        const { data: appRow, error: fetchError } = await supabaseAdmin
            .from("applications")
            .select("*")
            .eq("tracking_code", cleanCode)
            .maybeSingle();

        if (fetchError || !appRow) {
            return null;
        }

        const currentApp = appRow as Application;
        const currentReviews = extractDocumentReviews(currentApp.notes);
        const nextReviews: Record<string, DocumentReviewMeta> = { ...currentReviews };

        if (update === null) {
            delete nextReviews[fileName];
        } else {
            const existing = nextReviews[fileName];
            nextReviews[fileName] = {
                status: update.status || existing?.status || "pending",
                feedback:
                    update.feedback !== undefined
                        ? update.feedback
                        : existing?.feedback || "",
                originalName:
                    update.originalName || existing?.originalName || fileName,
                updated_at: new Date().toISOString(),
            };
        }

        const baseNotes =
            Array.isArray(currentApp.notes) && currentApp.notes.length > 0
                ? currentApp.notes
                : DEFAULT_STEPS;
        const stepTwoIdx = baseNotes.findIndex((s) => s.step === 2);
        const targetIdx =
            stepTwoIdx >= 0 ? stepTwoIdx : Math.min(1, baseNotes.length - 1);

        const updatedNotes = baseNotes.map((step, index) => {
            if (index === targetIdx) {
                return {
                    ...step,
                    document_reviews: nextReviews,
                };
            }
            return step;
        });

        const { data: updatedApp, error: updateError } = await supabaseAdmin
            .from("applications")
            .update({
                notes: updatedNotes,
            })
            .eq("id", currentApp.id)
            .select("*")
            .maybeSingle();

        if (updateError) {
            console.error("Failed to update document review metadata:", updateError);
            return null;
        }

        return (updatedApp as Application) || null;
    });
}

/**
 * Broadcasts `documents_updated` to both `track:${trackingCode}` and `admin:live`.
 */
export async function broadcastDocumentsUpdated(
    trackingCode: string,
    documents?: UploadedDocumentInfo[],
    action = "updated"
): Promise<void> {
    const cleanCode = trackingCode.trim().toUpperCase();
    try {
        const docs =
            documents ?? (await getApplicationDocumentsWithMeta(cleanCode, false));
        const studentDocs = docs.map((d) => ({
            name: d.name,
            id: d.id || d.name,
            created_at: d.created_at,
            status: d.status || "pending",
            feedback: d.feedback || "",
            originalName: d.originalName || d.name,
            updated_at: d.updated_at || d.created_at,
        }));

        const payload = {
            trackingCode: cleanCode,
            documents: studentDocs,
            action,
            timestamp: new Date().toISOString(),
        };

        await Promise.allSettled([
            broadcastToChannel(`track:${cleanCode}`, "documents_updated", payload),
            broadcastToChannel("admin:live", "documents_updated", payload),
        ]);
    } catch (err) {
        console.error("Failed to broadcast documents_updated:", err);
    }
}
