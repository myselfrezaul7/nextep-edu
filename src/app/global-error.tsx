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
                <style dangerouslySetInnerHTML={{
                    __html: `
                        @keyframes float {
                            0% { transform: translateY(0px); }
                            50% { transform: translateY(-10px); }
                            100% { transform: translateY(0px); }
                        }
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(20px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        @keyframes floatParticle {
                            0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
                            50% { transform: translateY(-20px) scale(1.5); opacity: 0.8; }
                        }
                        .error-container {
                            animation: fadeIn 0.8s ease-out forwards;
                        }
                        .error-header {
                            animation: float 3s ease-in-out infinite;
                        }
                        .retry-button {
                            transition: all 0.3s ease;
                        }
                        .retry-button:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 10px 25px -5px rgba(212, 175, 55, 0.4);
                        }
                        .particle {
                            position: absolute;
                            background: #D4AF37;
                            border-radius: 50%;
                            animation: floatParticle linear infinite;
                        }
                    `
                }} />
                <div style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "system-ui, sans-serif",
                    padding: "1rem",
                    background: "#0B1120",
                    color: "#F8FAFC",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    {[...Array(15)].map((_, i) => (
                        <div
                            key={i}
                            className="particle"
                            style={{
                                width: Math.random() * 6 + 2 + "px",
                                height: Math.random() * 6 + 2 + "px",
                                left: Math.random() * 100 + "%",
                                top: Math.random() * 100 + "%",
                                animationDuration: Math.random() * 3 + 2 + "s",
                                animationDelay: Math.random() * 2 + "s",
                            }}
                        />
                    ))}
                    <div className="error-container" style={{ textAlign: "center", maxWidth: "28rem", position: "relative", zIndex: 10 }}>
                        <h1 className="error-header" style={{ fontSize: "4rem", fontWeight: "bold", color: "#D4AF37", marginBottom: "1rem" }}>
                            Oops!
                        </h1>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
                            Something went wrong / কিছু ভুল হয়েছে
                        </h2>
                        <p style={{ color: "#94A3B8", marginBottom: "2rem" }}>
                            We&apos;re sorry for the inconvenience. Please try again.
                            <br />
                            সাময়িক অসুবিধার জন্য আমরা দুঃখিত। অনুগ্রহ করে আবার চেষ্টা করুন।
                        </p>
                        <button
                            className="retry-button"
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
