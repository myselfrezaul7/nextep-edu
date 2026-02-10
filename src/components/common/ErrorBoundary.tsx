"use client";

import { Component, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[50vh] flex items-center justify-center px-4">
                    <div className="text-center max-w-md">
                        <h2 className="text-2xl font-bold text-primary mb-4 font-heading">
                            Something went wrong
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            We encountered an unexpected error. Please try refreshing the page.
                        </p>
                        <button
                            onClick={() => {
                                this.setState({ hasError: false });
                                window.location.reload();
                            }}
                            className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
