import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };
  
  public readonly props: Props;

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 font-sans">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <i className="fas fa-exclamation-triangle text-3xl text-red-500 dark:text-red-400"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Something went wrong</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
              We encountered an unexpected error. This might be due to a network issue or a temporary glitch.
            </p>
            <div className="space-y-3">
                <button
                onClick={() => window.location.reload()}
                className="w-full bg-[#1a237e] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-900 transition shadow-lg flex items-center justify-center gap-2"
                >
                <i className="fas fa-sync-alt"></i> Reload Application
                </button>
                <button
                onClick={() => { localStorage.clear(); window.location.reload(); }}
                className="w-full bg-transparent border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 px-6 py-2 rounded-xl font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                Clear Cache & Reset
                </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;