import { useState, useEffect } from "react";
import { File, Download, Loader2, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

interface Document {
    name: string;
    id: string;
    created_at: string;
    url: string | null;
}

export function DocumentViewer({ trackingCode, token }: { trackingCode: string; token: string }) {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const res = await fetch(`/api/admin/documents?trackingCode=${trackingCode}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (res.ok) {
                    setDocuments(data.documents || []);
                } else {
                    toast.error("Failed to load documents");
                }
            } catch {
                toast.error("Network error loading documents");
            } finally {
                setLoading(false);
            }
        };

        fetchDocs();
    }, [trackingCode, token]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <div className="text-center p-8 border border-dashed border-white/20 rounded-xl">
                <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <File className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium text-foreground">{doc.name}</span>
                    </div>
                    {doc.url && (
                        <div className="flex gap-2">
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors" title="View Document">
                                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            </a>
                            <a href={doc.url} download className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors" title="Download Document">
                                <Download className="w-4 h-4 text-muted-foreground" />
                            </a>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
