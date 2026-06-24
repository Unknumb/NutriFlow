import { useEstadoConexion, type EstadoConexion } from '../../hooks/useEstadoConexion';

/**
 * Indicador discreto del estado de conexión con el sistema.
 * Pensado para que cualquier persona (no técnica) entienda de un vistazo si
 * todo funciona y, si algo falla, pueda volver a intentar con un botón.
 *
 * Se ubica en la barra superior del DashboardLayout.
 */

interface ConfigEstado {
  punto: string; // color del puntito
  etiqueta: string; // texto corto visible
  titulo: string; // título de la explicación
  detalle: string; // explicación en lenguaje simple
  pulso: boolean; // animar el punto (mientras comprueba)
  alerta: boolean; // resaltar (cuando hay problema) y mostrar "Reintentar"
}

const CONFIG: Record<EstadoConexion, ConfigEstado> = {
  verificando: {
    punto: 'bg-apricot',
    etiqueta: 'Comprobando…',
    titulo: 'Comprobando la conexión',
    detalle: 'Estamos verificando que el sistema esté funcionando. Espera un momento.',
    pulso: true,
    alerta: false,
  },
  conectado: {
    punto: 'bg-[#3C9A6E]',
    etiqueta: 'Conectado',
    titulo: 'Todo funciona correctamente',
    detalle: 'El sistema está conectado y la información se está cargando con normalidad.',
    pulso: false,
    alerta: false,
  },
  'sin-base-datos': {
    punto: 'bg-apricot',
    etiqueta: 'Datos no disponibles',
    titulo: 'El sistema responde, pero los datos no cargan',
    detalle:
      'El programa está funcionando, pero no se pudo cargar la información guardada. ' +
      'Espera unos segundos y presiona “Reintentar”. Si sigue igual, avisa al equipo técnico.',
    pulso: false,
    alerta: true,
  },
  'sin-conexion': {
    punto: 'bg-clinical-red',
    etiqueta: 'Sin conexión',
    titulo: 'No se pudo conectar con el sistema',
    detalle:
      'No estamos recibiendo respuesta del sistema. Revisa tu conexión a internet y ' +
      'presiona “Reintentar”. Si el problema continúa, avisa al equipo técnico.',
    pulso: false,
    alerta: true,
  },
};

export const IndicadorConexion = () => {
  const { estado, reintentar } = useEstadoConexion();
  const cfg = CONFIG[estado];

  return (
    <div className="group relative flex items-center" role="status" aria-live="polite">
      <div
        className={[
          'flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium transition-colors',
          cfg.alerta
            ? 'border-clinical-red/30 bg-clinical-red/5 text-clinical-red'
            : 'border-mist bg-white text-ink-soft',
        ].join(' ')}
      >
        <span className="relative flex h-2 w-2 shrink-0">
          {cfg.pulso && (
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full ${cfg.punto} opacity-60`}
            />
          )}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${cfg.punto}`} />
        </span>
        <span className="hidden sm:inline">{cfg.etiqueta}</span>

        {cfg.alerta && (
          <button
            type="button"
            onClick={reintentar}
            className="ml-1 rounded-full border border-clinical-red/40 px-1.5 py-0.5 text-[10px] font-semibold text-clinical-red transition-colors hover:bg-clinical-red hover:text-white focus-visible:outline-none"
            aria-label="Reintentar la conexión con el sistema"
          >
            Reintentar
          </button>
        )}
      </div>

      {/* Explicación en lenguaje simple, visible al pasar el cursor o con foco */}
      <div
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-30 mt-2 w-60 origin-top-right scale-95 rounded-card border border-mist bg-white p-3 text-left opacity-0 shadow-card transition-all duration-150 group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100"
      >
        <p className="text-xs font-semibold text-ink">{cfg.titulo}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">{cfg.detalle}</p>
      </div>
    </div>
  );
};
