import { Component } from "react";
import { reportError } from "../lib/errorReporter.js";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary capturó un error:", error, errorInfo);
    reportError(error, {
      type: "react_error_boundary",
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 max-w-md w-full">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-swarcoOrange/10 mb-4">
                <svg className="w-8 h-8 text-swarcoOrange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-swarcoBlue mb-2">
                Algo salió mal
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Ocurrió un error inesperado. Nuestro equipo ha sido notificado automáticamente y trabajará para resolverlo.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-swarcoBlue text-white px-6 py-3 rounded-full hover:bg-swarcoBlue/90 transition-colors"
                >
                  Recargar página
                </button>
                <button
                  onClick={() => window.location.href = "/"}
                  className="w-full border border-slate-300 text-slate-700 px-6 py-3 rounded-full hover:border-swarcoOrange/60 transition-colors"
                >
                  Ir al inicio
                </button>
              </div>
              {this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">
                    Detalles técnicos
                  </summary>
                  <pre className="mt-2 text-xs text-slate-500 bg-slate-50 p-3 rounded overflow-auto max-h-40">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
