import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('BreatheAI ErrorBoundary caught an issue:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="p-6 bg-white border border-[#E3E6DC] rounded-3xl shadow-card text-center space-y-3 my-4">
          <p className="text-sm font-bold text-[#173D32] font-heading">
            Notice: Temporary display issue recovered
          </p>
          <p className="text-xs text-[#58645C]">
            The application intercepted a render error and kept your session running safely.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-[#173D32] text-white text-xs font-semibold font-heading rounded-xl hover:bg-[#245543] transition-colors shadow-soft"
          >
            Reload Component
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
