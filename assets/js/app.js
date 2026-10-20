/**
 * Controlador Principal de la Aplicación Creador CC
 */

// Estado global de la aplicación inicializado con los datos de la plantilla maestra solicitada
const AppState = {
  currentData: {
    id: null,
    tipoPlantilla: 'master_official', // Plantilla Maestra Oficial por defecto
    codigoVerificacion: '0822NXIH99',
    fechaExpedicion: '12/04/2022 10:03:42 am',
    razonSocial: 'CompraMas',
    nit: '900421494-6',
    establecimiento: 'CompraMas',
    domicilioPrincipal: 'Jamundi',
    ciudad: 'Jamundi',
    matricula: '812832-16',
    fechaMatricula: '17 de marzo de 2011',
    ultimoAnoRenovado: '2022',
    fechaRenovacion: '25 de marzo de 2022',
    grupoNiif: 'Grupo 2',
    direccion: 'CL 9 # 56-69 of 201',
    ciudadCompleta: 'Cali - Valle',
    email: 'administracion@compramas.space',
    telefono: '3006864940',
    telefono2: 'No reportó',
    telefono3: 'No reportó',
    direccionJudicial: 'CL 9 # 56-69 of 201',
    municipioJudicial: 'Cali - Valle del Cauca',
    emailNotificacion: 'administracion@compramas.space',
    telefonoJudicial: '3006864940',
    telefonoJudicial2: 'No reportó',
    textoNotificacion: 'La persona jurídica Aura y Home SI autorizó recibir notificaciones personales a  través de correo electrónico, de conformidad con lo establecido en los artículos 291  del Código General del Proceso y 67 del Código de Procedimiento Administrativo y de  lo Contencioso administrativo.'
  },
  zoomLevel: 1.0,
  currentPageIndex: 0,
  totalPages: 1,
  previewVerified: true,
  manualChamberSelection: false,
  bulkList: []
};

// Toast de notificación
function showToast(message, duration = 3000) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  populateChamberDropdown();
  initFormInputs();
  renderCurrentDocument();
  initMandatoryButtons();
  initPreviewControls();
  initBulkView();
  initTemplateManager();
  renderHistoryTable();
});

/**
 * Gestión de pestañas (Generador Individual / Generación Masiva / Gestor Plantillas / Historial)
 */
function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetView = tab.dataset.target;
      document.querySelectorAll('.view-section').forEach(view => {
        view.classList.remove('active');
      });
      document.getElementById(targetView).classList.add('active');

      if (targetView === 'view-history') {
        renderHistoryTable();
      } else if (targetView === 'view-templates') {
        renderCustomTemplatesTable();
      }
    });
  });
}

/**
 * Rellena el dropdown de cámaras con las del sistema y las personalizadas
 */
function populateChamberDropdown() {
  const select = document.getElementById('field-camaraSeleccionada');
  if (!select) return;

  const currentVal = select.value || AppState.currentData.camaraSeleccionada || 'bucaramanga';
  const catalog = getUnifiedChamberCatalog();

  select.innerHTML = Object.values(catalog).map(ch => {
    const isCustomTag = ch.isCustom ? ' (Personalizada)' : '';
    return `<option value="${ch.id}">${ch.name}${isCustomTag}</option>`;
  }).join('');

  if (catalog[currentVal]) {
    select.value = currentVal;
  }
}

/**
 * Vincula los inputs del formulario al estado
 */
function initFormInputs() {
  // Llenar campos con los valores del estado
  for (const [key, value] of Object.entries(AppState.currentData)) {
    const input = document.getElementById(`field-${key}`);
    if (input) {
      input.value = value || '';
      input.addEventListener('input', (e) => {
        AppState.currentData[key] = e.target.value;
        
        // Sincronizar sinónimos de domicilio/ciudad
        if (key === 'domicilioPrincipal') {
          AppState.currentData.ciudad = e.target.value;
        } else if (key === 'ciudad') {
          AppState.currentData.domicilioPrincipal = e.target.value;
        }

        // Si el usuario cambia la ciudad, auto-detectar y sugerir la cámara si no ha sido forzada
        if (key === 'ciudad' || key === 'domicilioPrincipal') {
          const matchedChamber = getChamberByCity(e.target.value);
          const camaraSelect = document.getElementById('field-camaraSeleccionada');
          if (camaraSelect && matchedChamber && !AppState.manualChamberSelection) {
            camaraSelect.value = matchedChamber.id;
            AppState.currentData.camaraSeleccionada = matchedChamber.id;
          }
        }

        AppState.previewVerified = false;
        updateActionButtonsState();
        renderCurrentDocument();
      });
    }
  }

  // Cambio manual de Cámara de Comercio Oficial
  const camaraSelect = document.getElementById('field-camaraSeleccionada');
  if (camaraSelect) {
    camaraSelect.addEventListener('change', (e) => {
      const chamberKey = e.target.value;
      AppState.manualChamberSelection = true;
      AppState.currentData.camaraSeleccionada = chamberKey;
      renderCurrentDocument();
    });
  }
}

/**
 * Renderiza el documento en el contenedor principal de vista previa
 */
function renderCurrentDocument() {
  const container = document.getElementById('document-preview-render');
  if (!container) return;

  container.innerHTML = TemplateEngine.renderDocument(AppState.currentData);
  
  const pages = container.querySelectorAll('.cc-page');
  AppState.totalPages = pages.length;
  updatePaginationIndicator();

  AppState.previewVerified = true;
  updateActionButtonsState();

  const filenameDisplay = document.getElementById('computed-filename');
  if (filenameDisplay) {
    filenameDisplay.textContent = PDFGenerator.generateFileName(AppState.currentData);
  }
}

/**
 * Actualiza el estado visual de los botones obligatorios
 */
function updateActionButtonsState() {
  const downloadBtn = document.getElementById('btn-mandatory-download');
  if (downloadBtn) {
    if (AppState.previewVerified) {
      downloadBtn.disabled = false;
      downloadBtn.style.opacity = '1';
      downloadBtn.title = 'Descargar PDF verificado';
    } else {
      downloadBtn.disabled = true;
      downloadBtn.style.opacity = '0.5';
      downloadBtn.title = 'Debe generar o previsualizar el documento antes de descargar';
    }
  }
}

/**
 * Inicialización de los 4 botones obligatorios:
 * [ VISTA PREVIA ] [ EDITAR ] [ EXPORTAR PDF ] [ DESCARGAR PDF ]
 */
function initMandatoryButtons() {
  // [ VISTA PREVIA ]
  document.getElementById('btn-mandatory-preview')?.addEventListener('click', () => {
    openFullscreenPreview();
  });

  // [ EDITAR ]
  document.getElementById('btn-mandatory-edit')?.addEventListener('click', () => {
    const firstInput = document.getElementById('field-razonSocial');
    if (firstInput) {
      firstInput.focus();
      firstInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showToast('Modo edición activo: modifique los campos necesarios.');
    }
  });

  // [ EXPORTAR PDF ]
  document.getElementById('btn-mandatory-export')?.addEventListener('click', async () => {
    await handleExportPDF(true);
  });

  // [ DESCARGAR PDF ]
  document.getElementById('btn-mandatory-download')?.addEventListener('click', async () => {
    await handleExportPDF(true);
  });
}

/**
 * Procesa la exportación y guardado del PDF en el historial
 */
async function handleExportPDF(triggerDownload = true) {
  const container = document.getElementById('document-preview-render');
  const exportBtn = document.getElementById('btn-mandatory-export');
  const downloadBtn = document.getElementById('btn-mandatory-download');
  
  const originalExportText = exportBtn ? exportBtn.innerHTML : '';
  const originalDownText = downloadBtn ? downloadBtn.innerHTML : '';

  try {
    if (exportBtn) exportBtn.innerHTML = '⌛ Generando PDF...';
    if (downloadBtn) downloadBtn.innerHTML = '⌛ Generando...';

    if (!AppState.previewVerified) {
      renderCurrentDocument();
    }

    const result = await PDFGenerator.generateFromDOM(container, AppState.currentData, {
      download: triggerDownload,
      returnBlob: true
    });

    StorageManager.save(AppState.currentData, result.filename);
    showToast(`✓ PDF "${result.filename}" generado exitosamente.`);
    renderHistoryTable();
  } catch (error) {
    console.error("Error al exportar PDF:", error);
    alert("Error al generar el PDF: " + error.message);
  } finally {
    if (exportBtn) exportBtn.innerHTML = originalExportText;
    if (downloadBtn) downloadBtn.innerHTML = originalDownText;
  }
}

/**
 * Controles de Vista Previa (Zoom, Navegación de páginas, Imprimir)
 */
function initPreviewControls() {
  document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
    AppState.zoomLevel = Math.min(AppState.zoomLevel + 0.1, 1.8);
    applyZoom();
  });

  document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
    AppState.zoomLevel = Math.max(AppState.zoomLevel - 0.1, 0.4);
    applyZoom();
  });

  document.getElementById('btn-zoom-reset')?.addEventListener('click', () => {
    AppState.zoomLevel = 1.0;
    applyZoom();
  });

  document.getElementById('btn-page-prev')?.addEventListener('click', () => {
    const pages = document.querySelectorAll('#document-preview-render .cc-page');
    if (pages.length > 0 && AppState.currentPageIndex > 0) {
      AppState.currentPageIndex--;
      pages[AppState.currentPageIndex].scrollIntoView({ behavior: 'smooth' });
      updatePaginationIndicator();
    }
  });

  document.getElementById('btn-page-next')?.addEventListener('click', () => {
    const pages = document.querySelectorAll('#document-preview-render .cc-page');
    if (pages.length > 0 && AppState.currentPageIndex < pages.length - 1) {
      AppState.currentPageIndex++;
      pages[AppState.currentPageIndex].scrollIntoView({ behavior: 'smooth' });
      updatePaginationIndicator();
    }
  });

  document.getElementById('btn-print')?.addEventListener('click', () => {
    window.print();
  });

  document.getElementById('modal-close-btn')?.addEventListener('click', closeFullscreenPreview);
  document.getElementById('modal-preview-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-preview-backdrop') closeFullscreenPreview();
  });
}

function applyZoom() {
  const container = document.getElementById('document-preview-render');
  if (container) {
    container.style.transform = `scale(${AppState.zoomLevel})`;
    container.style.transformOrigin = 'top center';
  }
  const zoomDisplay = document.getElementById('zoom-display');
  if (zoomDisplay) {
    zoomDisplay.textContent = `${Math.round(AppState.zoomLevel * 100)}%`;
  }
}

function updatePaginationIndicator() {
  const indicator = document.getElementById('page-indicator');
  if (indicator) {
    indicator.textContent = `Páginas: ${AppState.totalPages}`;
  }
}

function openFullscreenPreview() {
  const modal = document.getElementById('modal-preview-backdrop');
  const modalBody = document.getElementById('modal-preview-body');
  if (!modal || !modalBody) return;

  modalBody.innerHTML = `
    <div class="cc-document-wrapper" style="transform: scale(0.9); transform-origin: top center;">
      ${TemplateEngine.renderDocument(AppState.currentData)}
    </div>
  `;
  modal.classList.add('active');
}

function closeFullscreenPreview() {
  const modal = document.getElementById('modal-preview-backdrop');
  if (modal) modal.classList.remove('active');
}

/**
 * GENERACIÓN MASIVA (NIT | CIUDAD | RAZÓN SOCIAL)
 */
function initBulkView() {
  const bulkInput = document.getElementById('bulk-text-input');
  const parseBtn = document.getElementById('btn-parse-bulk');
  const generateAllBtn = document.getElementById('btn-generate-all-bulk');

  parseBtn?.addEventListener('click', () => {
    const rawText = bulkInput ? bulkInput.value : '';
    parseBulkText(rawText);
  });

  generateAllBtn?.addEventListener('click', async () => {
    if (AppState.bulkList.length === 0) {
      alert("Primero debe ingresar y procesar la lista de empresas.");
      return;
    }

    const progressBox = document.getElementById('bulk-progress-box');
    const progressBar = document.getElementById('bulk-progress-bar');
    const progressText = document.getElementById('bulk-progress-text');

    if (progressBox) progressBox.style.display = 'block';

    try {
      generateAllBtn.disabled = true;
      generateAllBtn.innerHTML = '⌛ Generando lote...';

      const result = await PDFGenerator.generateBulkZip(AppState.bulkList, (current, total, name) => {
        const percent = Math.round((current / total) * 100);
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressText) progressText.textContent = `Generando ${current} de ${total}: ${name} (${percent}%)`;
      });

      AppState.bulkList.forEach(item => {
        StorageManager.save(item);
      });

      showToast(`✓ Se generaron ${result.count} documentos en ${result.zipFilename}`);
      renderHistoryTable();
    } catch (e) {
      console.error(e);
      alert("Error durante la generación masiva: " + e.message);
    } finally {
      generateAllBtn.disabled = false;
      generateAllBtn.innerHTML = '📦 [ DESCARGAR TODOS LOS PDF ] (ZIP)';
      if (progressBox) progressBox.style.display = 'none';
    }
  });
}

function parseBulkText(text) {
  if (!text || !text.trim()) {
    alert("Por favor ingrese las líneas con el formato: NIT | CIUDAD | RAZÓN SOCIAL");
    return;
  }

  const lines = text.trim().split('\n');
  const parsed = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    let parts = trimmed.includes('|') ? trimmed.split('|') :
                trimmed.includes('\t') ? trimmed.split('\t') :
                trimmed.split(',');

    if (parts.length >= 2) {
      const nit = parts[0]?.trim();
      const ciudad = parts[1]?.trim();
      const razonSocial = parts[2]?.trim() || '';

      if (nit && ciudad) {
        const chamber = getChamberByCity(ciudad);
        parsed.push({
          id: 'CC_BULK_' + Date.now() + '_' + index,
          tipoPlantilla: 'master_official',
          camaraSeleccionada: chamber.id,
          codigoVerificacion: TemplateEngine.generateVerificationCode(chamber.id === 'cali' ? '08' : '02'),
          fechaExpedicion: TemplateEngine.formatColombianDate(),
          nit: nit,
          ciudad: ciudad,
          domicilioPrincipal: ciudad,
          razonSocial: razonSocial,
          establecimiento: razonSocial,
          matricula: `${Math.floor(100000 + Math.random() * 900000)}-16`,
          fechaMatricula: '17 de marzo de 2011',
          ultimoAnoRenovado: '2022',
          fechaRenovacion: '25 de marzo de 2022',
          grupoNiif: 'Grupo 2',
          direccion: 'CL 9 # 56-69 of 201',
          ciudadCompleta: `${ciudad} - Colombia`,
          email: `administracion@${razonSocial ? razonSocial.toLowerCase().replace(/[^a-z0-9]/g, '') : 'empresa'}.space`,
          telefono: '3006864940',
          telefono2: 'No reportó',
          telefono3: 'No reportó',
          direccionJudicial: 'CL 9 # 56-69 of 201',
          municipioJudicial: `${ciudad} - Colombia`,
          emailNotificacion: `administracion@${razonSocial ? razonSocial.toLowerCase().replace(/[^a-z0-9]/g, '') : 'empresa'}.space`,
          telefonoJudicial: '3006864940',
          telefonoJudicial2: 'No reportó',
          textoNotificacion: `La persona jurídica ${razonSocial || 'Aura y Home'} SI autorizó recibir notificaciones personales a  través de correo electrónico, de conformidad con lo establecido en los artículos 291  del Código General del Proceso y 67 del Código de Procedimiento Administrativo y de  lo Contencioso administrativo.`
        });
      }
    }
  });

  AppState.bulkList = parsed;
  renderBulkTable();

  const generateAllBtn = document.getElementById('btn-generate-all-bulk');
  if (generateAllBtn) {
    generateAllBtn.disabled = parsed.length === 0;
  }

  showToast(`Se cargaron ${parsed.length} empresas para procesar.`);
}

function renderBulkTable() {
  const tbody = document.getElementById('bulk-table-body');
  if (!tbody) return;

  if (AppState.bulkList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color:#64748b;">No hay empresas en la lista masiva. Pegue sus datos arriba y presione "Procesar Lista".</td></tr>`;
    return;
  }

  tbody.innerHTML = AppState.bulkList.map((item, idx) => {
    const filename = PDFGenerator.generateFileName(item);
    return `
      <tr>
        <td><strong>${idx + 1}</strong></td>
        <td><code>${item.nit}</code></td>
        <td><strong>${item.ciudad}</strong><br><span style="font-size:11px; color:#0284c7; font-weight:600;">📍 ${getChamberByCity(item.ciudad).name}</span></td>
        <td>${item.razonSocial || '<em style="color:#94a3b8">Sin razón social</em>'}</td>
        <td>
          <span style="font-size:11px; font-family:monospace; background:#e2e8f0; padding:2px 6px; border-radius:4px;">${filename}</span>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * HISTORIAL Y CONSERVACIÓN DE DOCUMENTOS
 */
function renderHistoryTable() {
  const tbody = document.getElementById('history-table-body');
  if (!tbody) return;

  const records = StorageManager.getAll();

  if (records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px; color:#64748b;">No hay documentos en el historial todavía. Los documentos generados se conservarán aquí automáticamente.</td></tr>`;
    return;
  }

  tbody.innerHTML = records.map((record) => {
    return `
      <tr>
        <td><code>${record.filename}</code></td>
        <td><strong>${record.razonSocial || 'N/A'}</strong></td>
        <td>${record.nit || 'N/A'}</td>
        <td>${record.ciudad || 'N/A'}</td>
        <td>${record.fechaLegible || 'Reciente'}</td>
        <td style="white-space: nowrap;">
          <button class="action-btn-sm btn-open" onclick="handleHistoryOpen('${record.id}')" title="Abrir en el editor">📂 Abrir</button>
          <button class="action-btn-sm btn-view" onclick="handleHistoryView('${record.id}')" title="Ver documento">👁️ Ver</button>
          <button class="action-btn-sm btn-down" onclick="handleHistoryDownload('${record.id}')" title="Descargar archivo PDF">⬇️ Descargar PDF</button>
          <button class="action-btn-sm btn-regen" onclick="handleHistoryRegenerate('${record.id}')" title="Regenerar con nuevos sellos">🔄 Regenerar</button>
          <button class="action-btn-sm btn-del" onclick="handleHistoryDelete('${record.id}')" title="Eliminar registro">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

window.handleHistoryOpen = function(id) {
  const record = StorageManager.getById(id);
  if (!record) return;

  AppState.currentData = { ...record };
  initFormInputs();
  renderCurrentDocument();

  document.querySelector('.nav-tab-btn[data-target="view-generator"]')?.click();
  showToast(`Documento "${record.filename}" cargado en el editor.`);
};

window.handleHistoryView = function(id) {
  const record = StorageManager.getById(id);
  if (!record) return;

  AppState.currentData = { ...record };
  openFullscreenPreview();
};

window.handleHistoryDownload = async function(id) {
  const record = StorageManager.getById(id);
  if (!record) return;

  showToast(`Generando y descargando PDF "${record.filename}"...`);
  const res = await PDFGenerator.generateSingleFromData(record);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(res.blob);
  a.download = res.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
};

window.handleHistoryRegenerate = async function(id) {
  const record = StorageManager.getById(id);
  if (!record) return;

  record.codigoVerificacion = TemplateEngine.generateVerificationCode('08');
  record.fechaExpedicion = TemplateEngine.formatColombianDate();

  StorageManager.save(record);
  renderHistoryTable();
  showToast(`✓ Documento regenerado con código ${record.codigoVerificacion} y fecha actualizada.`);
};

window.handleHistoryDelete = function(id) {
  if (confirm("¿Está seguro de eliminar este documento del historial?")) {
    StorageManager.delete(id);
    renderHistoryTable();
    showToast("Documento eliminado del historial.");
  }
};

/**
 * =========================================================================
 * GESTOR DE PLANTILLAS Y LOGOS (SUBIR SIN TOCAR CÓDIGO)
 * =========================================================================
 */
let currentUploadedLogoBase64 = null;

function initTemplateManager() {
  const fileInput = document.getElementById('custom-logo-file');
  const previewBox = document.getElementById('custom-logo-preview-box');
  const previewImg = document.getElementById('custom-logo-preview-img');
  const saveBtn = document.getElementById('btn-save-custom-template');
  const resetBtn = document.getElementById('btn-reset-custom-form');
  const exportBtn = document.getElementById('btn-export-templates');
  const importBtn = document.getElementById('btn-import-templates');
  const inputImportJson = document.getElementById('input-import-json');

  // Vista previa al cargar un logotipo
  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        currentUploadedLogoBase64 = evt.target.result;
        if (previewImg) previewImg.src = currentUploadedLogoBase64;
        if (previewBox) previewBox.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  // Guardar nueva plantilla
  saveBtn?.addEventListener('click', () => {
    const name = document.getElementById('custom-name')?.value.trim();
    const city = document.getElementById('custom-city')?.value.trim();
    const keywords = document.getElementById('custom-keywords')?.value.trim();
    const verifyUrl = document.getElementById('custom-verify-url')?.value.trim();
    const disclaimer = document.getElementById('custom-disclaimer')?.value.trim();
    const posRadio = document.querySelector('input[name="custom-logo-pos"]:checked');
    const logoPosition = posRadio ? posRadio.value : 'left';
    const editId = document.getElementById('custom-template-id')?.value;

    if (!name || !city) {
      alert("Por favor ingrese el Nombre de la Cámara y la Ciudad Principal.");
      return;
    }

    const templateData = {
      id: editId || 'custom_' + city.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now(),
      name: name,
      city: city,
      keywords: keywords || city,
      verifyUrl: verifyUrl || 'www.confecamaras.org.co',
      disclaimer: disclaimer || null,
      logoPosition: logoPosition,
      logoBase64: currentUploadedLogoBase64 || null
    };

    StorageManager.saveCustomTemplate(templateData);
    showToast(`✓ Plantilla "${name}" guardada exitosamente.`);

    resetCustomForm();
    populateChamberDropdown();
    renderCustomTemplatesTable();
  });

  resetBtn?.addEventListener('click', resetCustomForm);

  // Exportar plantillas a JSON
  exportBtn?.addEventListener('click', () => {
    StorageManager.exportTemplatesJSON();
    showToast("Archivo JSON de plantillas descargado.");
  });

  // Importar plantillas desde JSON
  importBtn?.addEventListener('click', () => {
    inputImportJson?.click();
  });

  inputImportJson?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        const res = StorageManager.importTemplatesJSON(evt.target.result);
        if (res.success) {
          showToast(`✓ Se importaron ${res.count} plantillas correctamente.`);
          populateChamberDropdown();
          renderCustomTemplatesTable();
        } else {
          alert("Error al importar: " + res.error);
        }
      };
      reader.readAsText(file);
    }
  });
}

function resetCustomForm() {
  const form = document.getElementById('custom-template-form');
  if (form) form.reset();
  document.getElementById('custom-template-id').value = '';
  currentUploadedLogoBase64 = null;
  const previewBox = document.getElementById('custom-logo-preview-box');
  if (previewBox) previewBox.style.display = 'none';
}

function renderCustomTemplatesTable() {
  const tbody = document.getElementById('custom-templates-table-body');
  if (!tbody) return;

  const catalog = getUnifiedChamberCatalog();
  const list = Object.values(catalog);

  tbody.innerHTML = list.map(item => {
    const logoSrc = getChamberLogoSrc(item);
    const isCustom = item.isCustom;
    const typeBadge = isCustom 
      ? `<span style="background:#dcfce7; color:#15803d; font-size:11px; padding:3px 8px; border-radius:4px; font-weight:700;">Personalizada</span>`
      : `<span style="background:#e2e8f0; color:#475569; font-size:11px; padding:3px 8px; border-radius:4px; font-weight:700;">Sistema</span>`;

    const actions = isCustom ? `
      <button class="action-btn-sm btn-open" onclick="useCustomTemplate('${item.id}')" title="Usar en el editor">Usar</button>
      <button class="action-btn-sm btn-del" onclick="deleteCustomTemplate('${item.id}')" title="Eliminar plantilla">🗑️</button>
    ` : `
      <button class="action-btn-sm btn-open" onclick="useCustomTemplate('${item.id}')" title="Usar en el editor">Usar</button>
    `;

    return `
      <tr>
        <td>
          <img src="${logoSrc}" alt="${item.name}" style="max-height: 38px; max-width: 75px; object-fit: contain; border-radius: 4px; background: #fff; padding: 2px;">
        </td>
        <td><strong>${item.name}</strong></td>
        <td>
          ${item.city} <br>
          <small style="color:#64748b;">${(item.keywords || []).slice(0, 4).join(', ')}</small>
        </td>
        <td><span style="font-size:12px; font-weight:600;">${item.logoPosition === 'right' ? 'Sup. Derecha' : 'Sup. Izquierda'}</span></td>
        <td>${typeBadge}</td>
        <td style="text-align: right; white-space: nowrap;">${actions}</td>
      </tr>
    `;
  }).join('');
}

window.useCustomTemplate = function(id) {
  const catalog = getUnifiedChamberCatalog();
  const item = catalog[id];
  if (!item) return;

  AppState.currentData.camaraSeleccionada = item.id;
  AppState.currentData.ciudad = item.city;
  AppState.currentData.ciudadCompleta = `${item.city} - Colombia`;

  const camaraSelect = document.getElementById('field-camaraSeleccionada');
  if (camaraSelect) camaraSelect.value = item.id;

  const ciudadInput = document.getElementById('field-ciudad');
  if (ciudadInput) ciudadInput.value = item.city;

  const ciudadCompletaInput = document.getElementById('field-ciudadCompleta');
  if (ciudadCompletaInput) ciudadCompletaInput.value = AppState.currentData.ciudadCompleta;

  renderCurrentDocument();
  document.querySelector('.nav-tab-btn[data-target="view-generator"]')?.click();
  showToast(`Plantilla "${item.name}" cargada en el generador.`);
};

window.deleteCustomTemplate = function(id) {
  if (confirm("¿Está seguro de eliminar esta plantilla personalizada?")) {
    StorageManager.deleteCustomTemplate(id);
    populateChamberDropdown();
    renderCustomTemplatesTable();
    showToast("Plantilla eliminada.");
  }
};
