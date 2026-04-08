import React, { Component, ErrorInfo, ReactNode } from "react";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean; message: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error("ErrorBoundary", err, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="card error-boundary" role="alert">
            <h2>Something went wrong</h2>
            <p className="muted">{this.state.message}</p>
            <button type="button" className="primary" onClick={() => window.location.reload()}>
              Reload page
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
