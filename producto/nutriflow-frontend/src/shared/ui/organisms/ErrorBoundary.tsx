import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Límite de error global. Evita que una excepción de render deje la app en
 * pantalla en blanco: muestra un fallback con opción de recargar.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log para diagnóstico; en producción podría enviarse a un servicio.
    console.error('ErrorBoundary capturó un error de render:', error, info);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-porcelain p-6">
          <div className="max-w-md w-full bg-white border border-mist rounded-card shadow-card p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-clinical-red/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-clinical-red" />
            </div>
            <h1 className="text-xl font-display font-semibold text-ink mb-2">Algo salió mal</h1>
            <p className="text-sm text-ink-soft mb-6">
              Ocurrió un error inesperado en la aplicación. Puedes recargar la página para continuar.
            </p>
            <button
              onClick={this.handleReload}
              className="px-6 py-2.5 bg-pine hover:bg-pine-soft text-porcelain font-medium rounded-md transition-colors"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
