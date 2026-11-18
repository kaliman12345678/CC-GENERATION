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
   * Genera el PDF a partir del contenedor de páginas DOM con texto vectorial nativo
   * Exporta texto real seleccionable y buscable (no una imagen rasterizada / fotografía JPG)
   * Cumple los requisitos de verificación digital de Meta y Confecámaras.
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

    // Configurar metadatos oficiales del documento PDF
    const cleanRazon = (data.razonSocial || 'CERTIFICADO').toUpperCase();
    const cleanNit = (data.nit || '').trim();
    pdf.setProperties({
      title: `CERTIFICADO DE EXISTENCIA Y REPRESENTACION LEGAL - ${cleanRazon}`,
      subject: 'Certificado Oficial de Entidades Sin Ánimo de Lucro',
      author: 'Cámara de Comercio de Colombia',
      keywords: `Cámara de Comercio, Certificado, ${cleanNit}, ${cleanRazon}`,
      creator: 'Creador CC — Generación Oficial de Certificados'
    });

    for (let i = 0; i < pages.length; i++) {
      const pageEl = pages[i];
      if (i > 0) {
        pdf.addPage('letter', 'portrait');
      }

      // Renderizar página completa en formato vectorial y texto real nativo
      this.renderPageVector(pdf, pageEl);
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
   * Renderiza el DOM de .cc-page directamente como texto vectorial nativo en jsPDF
   * Sin rasterizar a imagen JPG, permitiendo selección, copia y lectura OCR/PDF.
   */
  renderPageVector(pdf, pageEl) {
    const pageRect = pageEl.getBoundingClientRect();
    const pdfW = pdf.internal.pageSize.getWidth();  // 215.9 mm
    const pdfH = pdf.internal.pageSize.getHeight(); // 279.4 mm

    const baseW = pageRect.width || pageEl.offsetWidth || 816;
    const baseH = pageRect.height || pageEl.offsetHeight || 1056;
    const scaleX = pdfW / baseW;
    const scaleY = pdfH / baseH;

    const handledElements = new Set();

    // 1. Renderizar imágenes oficiales (Logos de la Cámara en alta fidelidad)
    const images = pageEl.querySelectorAll('img');
    images.forEach(img => {
      handledElements.add(img);
      const rect = img.getBoundingClientRect();
      const x = (rect.left - pageRect.left) * scaleX;
      const y = (rect.top - pageRect.top) * scaleY;
      const w = rect.width * scaleX;
      const h = rect.height * scaleY;

      if (img.src && w > 0 && h > 0) {
        const isJpeg = img.src.startsWith('data:image/jpeg') || img.src.endsWith('.jpg') || img.src.endsWith('.jpeg');
        const format = isJpeg ? 'JPEG' : 'PNG';
        try {
          pdf.addImage(img.src, format, x, y, w, h, undefined, 'FAST');
        } catch (e) {
          console.warn("No se pudo insertar logo en PDF:", e);
        }
      }
    });

    // 2. Renderizar separadores guionados (.dashed-separator) como líneas vectoriales nítidas
    const separators = pageEl.querySelectorAll('.dashed-separator');
    separators.forEach(sep => {
      handledElements.add(sep);
      const rect = sep.getBoundingClientRect();
      const y = (rect.top - pageRect.top + rect.height / 2) * scaleY;
      const x1 = (rect.left - pageRect.left) * scaleX;
      const x2 = (rect.right - pageRect.left) * scaleX;

      pdf.setDrawColor(70, 70, 70);
      pdf.setLineWidth(0.2);
      pdf.setLineDashPattern([1.2, 1.2], 0);
      pdf.line(x1, y, x2, y);
      pdf.setLineDashPattern([], 0); // Restaurar línea sólida
    });

    // 3. Extracción y renderizado de unidades de texto nativo
    const isTextUnit = (el) => {
      if (handledElements.has(el)) return false;
      if (el.tagName === 'IMG' || el.classList.contains('dashed-separator')) return false;

      const children = Array.from(el.children).filter(c => c.tagName !== '#text');
      // Elemento hoja sin hijos
      if (children.length === 0) {
        return (el.textContent || '').trim().length > 0;
      }
      // Elemento donde todos los hijos son etiquetas BR
      const nonBr = children.filter(c => c.tagName !== 'BR');
      if (nonBr.length === 0) {
        return (el.textContent || '').trim().length > 0;
      }
      // Párrafo continuo con formato inline (STRONG, B, EM)
      const isInlineOnly = nonBr.every(c => 
        c.tagName === 'STRONG' || c.tagName === 'B' || c.tagName === 'EM'
      );
      if (isInlineOnly) {
        return (el.textContent || '').trim().length > 0;
      }
      return false;
    };

    const renderTextElement = (el) => {
      const rawText = el.innerText || el.textContent;
      if (!rawText || !rawText.trim()) return;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const compStyle = window.getComputedStyle(el);
      const fontFam = compStyle.fontFamily.toLowerCase();
      const isHelvetica = fontFam.includes('arial') || fontFam.includes('sans-serif');
      const fontFamily = isHelvetica ? 'helvetica' : 'courier';

      const fWeight = compStyle.fontWeight;
      const isBold = fWeight === 'bold' || fWeight === '700' || fWeight === '800' || fWeight === '900' || el.tagName === 'STRONG' || el.tagName === 'B';
      const fontStyle = isBold ? 'bold' : 'normal';

      // Tamaño de fuente en puntos (pt)
      let fontSizePt = parseFloat(compStyle.fontSize) * 0.75;
      if (isNaN(fontSizePt) || fontSizePt < 4) fontSizePt = 9;

      pdf.setFont(fontFamily, fontStyle);
      pdf.setFontSize(fontSizePt);

      // Color de texto
      const colorMatch = compStyle.color.match(/\d+/g);
      if (colorMatch && colorMatch.length >= 3) {
        pdf.setTextColor(parseInt(colorMatch[0]), parseInt(colorMatch[1]), parseInt(colorMatch[2]));
      } else {
        pdf.setTextColor(17, 17, 17);
      }

      const align = compStyle.textAlign;
      const xLeft = (rect.left - pageRect.left) * scaleX;
      const xRight = (rect.right - pageRect.left) * scaleX;
      const xCenter = (xLeft + xRight) / 2;
      const yTop = (rect.top - pageRect.top) * scaleY;
      const widthMm = rect.width * scaleX;

      // Marco de recuadro si el elemento tiene borde propio (ej: banner de Cali)
      const borderTopWidth = parseFloat(compStyle.borderTopWidth) || 0;
      if (borderTopWidth > 0 && compStyle.borderTopStyle !== 'none') {
        pdf.setDrawColor(30, 30, 30);
        pdf.setLineWidth(0.25);
        pdf.rect(xLeft, yTop, widthMm, rect.height * scaleY);
      }

      // Fondo si no es transparente ni blanco
      const bg = compStyle.backgroundColor;
      if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)' && !bg.includes('255, 255, 255')) {
        const bgMatch = bg.match(/\d+/g);
        if (bgMatch && bgMatch.length >= 3) {
          pdf.setFillColor(parseInt(bgMatch[0]), parseInt(bgMatch[1]), parseInt(bgMatch[2]));
          pdf.rect(xLeft, yTop, widthMm, rect.height * scaleY, 'F');
        }
      }

      // Procesar saltos de línea explícitos o texto que hace wrap
      const hasLineBreaks = rawText.includes('\n');
      const isMultiLineBlock = widthMm > 35 && (rect.height * scaleY) > (fontSizePt * 0.352778 * 1.8);

      if (hasLineBreaks) {
        const lines = rawText.split('\n');
        const lineSpacing = (fontSizePt * 0.352778) * 1.35;
        lines.forEach((line, idx) => {
          const cleanLine = line.trim();
          if (!cleanLine) return;
          const yLine = yTop + idx * lineSpacing;
          if (align === 'center') {
            pdf.text(cleanLine, xCenter, yLine, { align: 'center', baseline: 'top' });
          } else if (align === 'right') {
            pdf.text(cleanLine, xRight, yLine, { align: 'right', baseline: 'top' });
          } else {
            pdf.text(cleanLine, xLeft, yLine, { baseline: 'top' });
          }
        });
      } else if (isMultiLineBlock) {
        const cleanParagraph = rawText.replace(/\s+/g, ' ').trim();
        const wrappedLines = pdf.splitTextToSize(cleanParagraph, widthMm);
        const lineSpacing = (fontSizePt * 0.352778) * 1.32;
        wrappedLines.forEach((line, idx) => {
          const yLine = yTop + idx * lineSpacing;
          if (align === 'center') {
            pdf.text(line, xCenter, yLine, { align: 'center', baseline: 'top' });
          } else {
            pdf.text(line, xLeft, yLine, { baseline: 'top' });
          }
        });
      } else {
        const singleText = rawText.replace(/\s+/g, ' ').trim();
        if (align === 'center') {
          pdf.text(singleText, xCenter, yTop, { align: 'center', baseline: 'top' });
        } else if (align === 'right') {
          pdf.text(singleText, xRight, yTop, { align: 'right', baseline: 'top' });
        } else {
          pdf.text(singleText, xLeft, yTop, { baseline: 'top' });
        }
      }
    };

    const walk = (el) => {
      if (handledElements.has(el)) return;

      if (isTextUnit(el)) {
        handledElements.add(el);
        renderTextElement(el);
        return;
      }

      for (let i = 0; i < el.children.length; i++) {
        walk(el.children[i]);
      }
    };

    walk(pageEl);
  },

  /**
   * Generación en memoria para lote masivo
   */
  async generateSingleFromData(data) {
    // Crear un contenedor temporal en offscreen (visible al layout engine)
    const offscreen = document.createElement('div');
    offscreen.style.position = 'fixed';
    offscreen.style.left = '-9999px';
    offscreen.style.top = '0px';
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
