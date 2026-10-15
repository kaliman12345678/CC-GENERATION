/**
 * Motor de Generación y Exportación de PDF (PDFGenerator)
 * Cumple con las reglas estrictas de fidelidad visual, nomenclatura y exportación ZIP.
 */

const PDFGenerator = {
  /**
   * Sanitiza y genera el nombre oficial obligatorio del archivo
   * Regla:
   * - Si existe razón social: RAZON_SOCIAL_NIT.pdf (Ej: COMERCIALIZADORA_ANDINA_9001234567.pdf)
   * - Si no existe razón social: NIT_CIUDAD.pdf (Ej: 9001234567_Medellin.pdf)
   * - Eliminar caracteres prohibidos y normalizar
   */
  generateFileName(data) {
    const sanitize = (str) => {
      if (!str) return '';
      return str
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Quitar tildes
        .replace(/[^a-zA-Z0-9_\-\s]/g, "") // Solo letras, números y espacios
        .replace(/\s+/g, "_") // Espacios a guion bajo
        .replace(/_+/g, "_") // Limpiar duplicados
        .toUpperCase();
    };

    const cleanNit = (data.nit || '')
      .replace(/[^0-9]/g, '') // Quitar puntos y guiones del NIT
      .trim();

    const cleanRazonSocial = sanitize(data.razonSocial);
    const cleanCiudad = sanitize(data.ciudad);

    let baseName = '';
    if (cleanRazonSocial && cleanRazonSocial.length > 0) {
      baseName = `${cleanRazonSocial}_${cleanNit || 'SIN_NIT'}`;
    } else {
      baseName = `${cleanNit || 'DOCUMENTO'}_${cleanCiudad || 'COLOMBIA'}`;
    }

    return `${baseName}.pdf`;
  },

  /**
   * Genera el PDF a partir del contenedor de páginas DOM
   * Asegura coincidencia visual 1:1 con la vista previa
   * @param {HTMLElement} containerElement - El contenedor con las páginas .cc-page
   * @param {Object} data - Datos del certificado
   * @param {Object} options - { download: boolean, returnBlob: boolean }
   */
  async generateFromDOM(containerElement, data, options = { download: true }) {
    if (!containerElement) {
      throw new Error("No se encontró el contenedor de páginas para exportar.");
    }

    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
      throw new Error("La librería jsPDF no está cargada en el sistema.");
    }

    const pages = containerElement.querySelectorAll('.cc-page');
    if (pages.length === 0) {
      throw new Error("No hay páginas renderizadas para generar el PDF.");
    }

    // Inicializar documento jsPDF formato Letter vertical (215.9 x 279.4 mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter',
      compress: true
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < pages.length; i++) {
      const pageEl = pages[i];
      if (i > 0) {
        pdf.addPage('letter', 'portrait');
      }

      // Renderizar la página con html2canvas en alta resolución (scale 2.0 = 192 DPI para nitidez perfecta)
      const canvas = await html2canvas(pageEl, {
        scale: 2.0,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1024
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    }

    const filename = this.generateFileName(data);

    if (options.download) {
      pdf.save(filename);
    }

    if (options.returnBlob) {
      return {
        blob: pdf.output('blob'),
        filename: filename
      };
    }

    return { filename };
  },

  /**
   * Generación en memoria para lote masivo
   */
  async generateSingleFromData(data) {
    // Crear un contenedor temporal en offscreen
    const offscreen = document.createElement('div');
    offscreen.style.position = 'fixed';
    offscreen.style.left = '-9999px';
    offscreen.style.top = '-9999px';
    offscreen.style.width = '215.9mm';
    offscreen.className = 'cc-document-wrapper';
    
    // Renderizar plantilla
    offscreen.innerHTML = TemplateEngine.renderDocument(data);
    document.body.appendChild(offscreen);

    try {
      const result = await this.generateFromDOM(offscreen, data, { download: false, returnBlob: true });
      return result;
    } finally {
      document.body.removeChild(offscreen);
    }
  },

  /**
   * Generación masiva de múltiples empresas y empaquetado en archivo ZIP
   * @param {Array} itemsList - Lista de objetos { nit, ciudad, razonSocial, ... }
   * @param {Function} onProgress - Callback (current, total, filename)
   */
  async generateBulkZip(itemsList, onProgress = null) {
    if (!window.JSZip) {
      throw new Error("Librería JSZip no disponible para comprimir los archivos.");
    }

    const zip = new JSZip();
    const total = itemsList.length;

    for (let i = 0; i < total; i++) {
      const item = itemsList[i];
      if (onProgress) {
        onProgress(i + 1, total, item.razonSocial || item.nit);
      }

      const generated = await this.generateSingleFromData(item);
      zip.file(generated.filename, generated.blob);
    }

    // Generar archivo ZIP final
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipFilename = "DOCUMENTOS_GENERADOS.zip";

    // Disparar descarga automática del ZIP
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(zipBlob);
    downloadLink.download = zipFilename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadLink.href);

    return { zipFilename, count: total };
  }
};
