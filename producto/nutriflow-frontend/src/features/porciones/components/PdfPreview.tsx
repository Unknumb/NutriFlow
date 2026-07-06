import { useEffect, useRef, useState } from "react";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// Vista previa del PDF renderizada con pdf.js sobre <canvas>. No usamos
// <PDFViewer>/<iframe> porque depende del visor de PDF nativo del navegador,
// que en algunos equipos (p. ej. Brave) no pinta PDFs embebidos y la vista
// previa queda en negro aunque el documento se genere bien.
export const PdfPreview = ({ blob, width = 820 }: { blob: Blob | null; width?: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!blob) return;
    let cancelado = false;

    (async () => {
      try {
        const data = await blob.arrayBuffer();
        const loadingTask = getDocument({ data });
        const doc = await loadingTask.promise;
        const container = containerRef.current;
        if (cancelado || !container) {
          loadingTask.destroy();
          return;
        }
        container.innerHTML = "";
        // Escalamos por devicePixelRatio para que el texto se vea nítido en retina.
        const dpr = window.devicePixelRatio || 1;
        for (let num = 1; num <= doc.numPages; num++) {
          if (cancelado) break;
          const page = await doc.getPage(num);
          const scale = width / page.getViewport({ scale: 1 }).width;
          const viewport = page.getViewport({ scale: scale * dpr });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = `${width}px`;
          canvas.style.display = "block";
          canvas.className = "border border-mist rounded-lg shadow-sm bg-white mb-4";
          container.appendChild(canvas);
          await page.render({ canvas, viewport }).promise;
        }
        loadingTask.destroy();
        if (!cancelado) setError(false);
      } catch (e) {
        console.error("Error renderizando la vista previa del PDF:", e);
        if (!cancelado) setError(true);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [blob, width]);

  if (error) {
    return (
      <p className="text-sm text-ink-soft py-8 text-center">
        No se pudo generar la vista previa. Usa el botón "Descargar PDF" para ver el documento.
      </p>
    );
  }

  return <div ref={containerRef} style={{ width }} />;
};
