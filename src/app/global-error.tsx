"use client";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "system-ui, sans-serif",
                    padding: "1rem",
                    background: "#0B1120",
                    color: "#F8FAFC",
                }}>
                    <div style={{ textAlign: "center", maxWidth: "28rem" }}>
                        <h1 style={{ fontSize: "4rem", fontWeight: "bold", color: "#D4AF37", marginBottom: "1rem" }}>
                            Oops!
                        </h1>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
                            Something went wrong
                        </h2>
                        <p style={{ color: "#94A3B8", marginBottom: "2rem" }}>
                            We&apos;re sorry for the inconvenience. Please try again.
                        </p>
                        <button
                            onClick={() => reset()}
                            style={{
                                padding: "0.75rem 2rem",
                                borderRadius: "2rem",
                                background: "#D4AF37",
                                color: "#0F172A",
                                fontWeight: "bold",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "1rem",
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
