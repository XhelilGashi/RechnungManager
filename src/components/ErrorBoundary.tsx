import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    const props = (this as any).props;
    if (this.state.hasError) {
      return (
        <div className="p-6 m-6 bg-red-50 border border-red-200 rounded-lg flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Ein Fehler ist aufgetreten</h2>
          <p className="text-slate-600 mb-4">{props.fallbackMessage || 'Leider ist beim Laden der Komponente ein Fehler aufgetreten. Bitte versuchen Sie es erneut.'}</p>
          <pre className="text-xs text-red-400 bg-red-100 p-4 rounded max-w-full overflow-auto break-all">
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => (this as any).setState({ hasError: false, error: null })}
            className="mt-6 px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition"
          >
            Erneut versuchen
          </button>
        </div>
      );
    }

    return props.children;
  }
}
