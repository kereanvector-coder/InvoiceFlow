import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[InvoiceFlow Error]:', error.message, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-border max-w-sm w-full text-center">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-2">Something went wrong.</h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-6">
              Your invoices are safe — this is just a display error.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
