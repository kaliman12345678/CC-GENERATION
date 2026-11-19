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
    reciboNo: '0030458833',
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
    sitioWeb: 'No reportó',
    direccionJudicial: 'CL 9 # 56-69 of 201',
    municipioJudicial: 'Cali - Valle',
    emailNotificacion: 'administracion@compramas.space',
    telefonoJudicial: '3006864940',
    telefonoJudicial2: 'No reportó',
    telefonoJudicial3: 'No reportó',
    textoNotificacion: 'La persona jurídica COMPRAMAS SI autorizó recibir notificaciones personales a través de correo electrónico, de conformidad con lo establecido en los artículos 291 del Código General del Proceso y 67 del Código de Procedimiento Administrativo y de lo Contencioso administrativo.'
  },
  zoomLevel: 1.0,
  currentPageIndex: 0,
  totalPages: 1,
  previewVerified: true,
  manualChamberSelection: false,
  manuallyEditedJudicial: {},
  manuallyEditedTextoNotificacion: false,
  manuallyEditedEstablecimiento: false,
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
  initJudicialSyncButton();
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
 * Genera el texto oficial de notificación autorizada con la razón social
 */
function getAuthorizedNotificationText(companyName) {
  const name = (companyName || 'la sociedad').trim().toUpperCase();
  return `La persona jurídica ${name} SI autorizó recibir notificaciones personales a través de correo electrónico, de conformidad con lo establecido en los artículos 291 del Código General del Proceso y 67 del Código de Procedimiento Administrativo y de lo Contencioso administrativo.`;
}

/**
 * Vincula los inputs del formulario al estado de manera bidireccional y dinámica
 */
function initFormInputs() {
  const formElements = document.querySelectorAll('#document-form input, #document-form select, #document-form textarea');
  formElements.forEach(input => {
    if (input.id && input.id.startsWith('field-') && input.id !== 'field-camaraSeleccionada') {
      const key = input.id.replace('field-', '');
      if (AppState.currentData[key] !== undefined) {
        input.value = AppState.currentData[key] || '';
      } else {
        AppState.currentData[key] = input.value || '';
      }

      input.oninput = (e) => {
        AppState.currentData[key] = e.target.value;
        
        // 1. Sincronizar sinónimos de domicilio/ciudad
        if (key === 'domicilioPrincipal') {
          AppState.currentData.ciudad = e.target.value;
        } else if (key === 'ciudad') {
          AppState.currentData.domicilioPrincipal = e.target.value;
        }

        // 2. Si se edita la Razón Social: sincronizar establecimiento y actualizar automáticamente
        // el párrafo de notificación autorizada con la razón social ingresada
        if (key === 'razonSocial') {
          if (!AppState.manuallyEditedEstablecimiento) {
            AppState.currentData.establecimiento = e.target.value;
            const estInput = document.getElementById('field-establecimiento');
            if (estInput) estInput.value = e.target.value;
          }

          if (!AppState.manuallyEditedTextoNotificacion) {
            const newText = getAuthorizedNotificationText(e.target.value);
            AppState.currentData.textoNotificacion = newText;
            const txtInput = document.getElementById('field-textoNotificacion');
            if (txtInput) txtInput.value = newText;
          }
        }

        if (key === 'establecimiento') {
          AppState.manuallyEditedEstablecimiento = true;
        }

        if (key === 'textoNotificacion') {
          AppState.manuallyEditedTextoNotificacion = true;
        }

        // 3. Auto-llenado automático de Sección 4 (Ubicación y Contacto) -> Sección 5 (Notificación Judicial)
        const judicialSyncMap = {
          'direccion': 'direccionJudicial',
          'ciudadCompleta': 'municipioJudicial',
          'email': 'emailNotificacion',
          'telefono': 'telefonoJudicial',
          'telefono2': 'telefonoJudicial2',
          'telefono3': 'telefonoJudicial3'
        };

        if (judicialSyncMap[key]) {
          const judTarget = judicialSyncMap[key];
          // Solo auto-llenar si el usuario no ha personalizado ese campo judicial de forma independiente
          if (!AppState.manuallyEditedJudicial[judTarget]) {
            AppState.currentData[judTarget] = e.target.value;
            const judInput = document.getElementById(`field-${judTarget}`);
            if (judInput) judInput.value = e.target.value;
          }
        }

        // Si el usuario edita directamente un campo de notificación judicial, marcarlo para no sobrescribir
        const judicialKeys = ['direccionJudicial', 'municipioJudicial', 'emailNotificacion', 'telefonoJudicial', 'telefonoJudicial2', 'telefonoJudicial3'];
        if (judicialKeys.includes(key)) {
          AppState.manuallyEditedJudicial[key] = true;
        }

        // 4. Si el usuario cambia la ciudad, auto-detectar y sugerir la cámara si no ha sido forzada
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
      };
    }
  });

  // Cambio manual de Cámara de Comercio Oficial
  const camaraSelect = document.getElementById('field-camaraSeleccionada');
  if (camaraSelect) {
    if (AppState.currentData.camaraSeleccionada) {
      camaraSelect.value = AppState.currentData.camaraSeleccionada;
    }
    camaraSelect.onchange = (e) => {
      const chamberKey = e.target.value;
      AppState.manualChamberSelection = true;
      AppState.currentData.camaraSeleccionada = chamberKey;
      renderCurrentDocument();
    };
  }
}

/**
 * Inicializa el botón para copiar/sincronizar datos de Ubicación y Contacto a Notificación Judicial
 */
function initJudicialSyncButton() {
  const btn = document.getElementById('btn-sync-judicial');
  if (!btn) return;

  btn.addEventListener('click', () => {
    AppState.manuallyEditedJudicial = {};
    AppState.manuallyEditedTextoNotificacion = false;

    // Sincronizar todos los campos de Sección 4 a Sección 5
    const syncPairs = [
      ['direccion', 'direccionJudicial'],
      ['ciudadCompleta', 'municipioJudicial'],
      ['email', 'emailNotificacion'],
      ['telefono', 'telefonoJudicial'],
      ['telefono2', 'telefonoJudicial2'],
      ['telefono3', 'telefonoJudicial3']
    ];

    syncPairs.forEach(([commKey, judKey]) => {
      const val = AppState.currentData[commKey] || '';
      AppState.currentData[judKey] = val;
      const judInput = document.getElementById(`field-${judKey}`);
      if (judInput) judInput.value = val;
    });

    // Actualizar párrafo de notificación autorizada con la razón social actual
    const legalText = getAuthorizedNotificationText(AppState.currentData.razonSocial);
    AppState.currentData.textoNotificacion = legalText;
    const txtInput = document.getElementById('field-textoNotificacion');
    if (txtInput) txtInput.value = legalText;

    AppState.previewVerified = false;
    updateActionButtonsState();
    renderCurrentDocument();
    showToast('Notificación Judicial sincronizada con Ubicación y Razón Social');
  });
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
          sitioWeb: 'No reportó',
          direccionJudicial: 'CL 9 # 56-69 of 201',
          municipioJudicial: `${ciudad} - Colombia`,
          emailNotificacion: `administracion@${razonSocial ? razonSocial.toLowerCase().replace(/[^a-z0-9]/g, '') : 'empresa'}.space`,
          telefonoJudicial: '3006864940',
          telefonoJudicial2: 'No reportó',
          telefonoJudicial3: 'No reportó',
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
  AppState.manuallyEditedJudicial = {};
  AppState.manuallyEditedTextoNotificacion = true;
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
 * GESTOR DE PLANTILLAS Y LOGOS (RECONOCIMIENTO AUTOMÁTICO Y CLONACIÓN)
 * =========================================================================
 */
let currentUploadedLogoBase64 = null;
let currentSampleTemplateBase64 = null;
let currentDetectedAnalysis = null;

const COLOMBIAN_CHAMBERS_DIRECTORY = [
  { name: 'CÁMARA DE COMERCIO DE BOGOTÁ', city: 'Bogotá', keywords: 'bogota, soacha, cundinamarca, chia, zipaquira', verifyUrl: 'www.ccb.org.co', logoPosition: 'left' },
  { name: 'CÁMARA DE COMERCIO DE MEDELLÍN PARA ANTIOQUIA', city: 'Medellín', keywords: 'medellin, antioquia, bello, envigado, itagui, rionegro', verifyUrl: 'www.camaramedellin.com.co', logoPosition: 'right' },
  { name: 'CÁMARA DE COMERCIO DE CALI', city: 'Cali', keywords: 'cali, valle, yumbo, jamundi, palmira', verifyUrl: 'www.ccc.org.co', logoPosition: 'left' },
  { name: 'CÁMARA DE COMERCIO DE BARRANQUILLA', city: 'Barranquilla', keywords: 'barranquilla, atlantico, soledad, malambo', verifyUrl: 'www.camarabaq.org.co', logoPosition: 'left' },
  { name: 'CÁMARA DE COMERCIO DE BUCARAMANGA', city: 'Bucaramanga', keywords: 'bucaramanga, santander, floridablanca, giron, piedecuesta', verifyUrl: 'www.camaradirecta.com', logoPosition: 'right' },
  { name: 'CÁMARA DE COMERCIO DE CARTAGENA', city: 'Cartagena', keywords: 'cartagena, bolivar, turbaco, arjona', verifyUrl: 'www.cccartagena.org.co', logoPosition: 'left' },
  { name: 'CÁMARA DE COMERCIO DE MANIZALES POR CALDAS', city: 'Manizales', keywords: 'manizales, caldas, villamaria, chinchina', verifyUrl: 'www.ccmpc.org.co', logoPosition: 'right' },
  { name: 'CÁMARA DE COMERCIO DE PEREIRA', city: 'Pereira', keywords: 'pereira, risaralda, dosquebradas, santa rosa', verifyUrl: 'www.camarapereira.org.co', logoPosition: 'right' },
  { name: 'CÁMARA DE COMERCIO DE CÚCUTA', city: 'Cúcuta', keywords: 'cucuta, norte de santander, villa del rosario, los patios', verifyUrl: 'www.cccucuta.org.co', logoPosition: 'right' },
  { name: 'CÁMARA DE COMERCIO DE ARMENIA Y DEL QUINDÍO', city: 'Armenia', keywords: 'armenia, quindio, calarca, montenegro, quimbaya', verifyUrl: 'www.camaraarmenia.org.co', logoPosition: 'left' },
  { name: 'CÁMARA DE COMERCIO DE IBAGUÉ', city: 'Ibagué', keywords: 'ibague, tolima, espinal, melgar', verifyUrl: 'www.ccibague.org', logoPosition: 'right' },
  { name: 'CÁMARA DE COMERCIO DE SANTA MARTA PARA EL MAGDALENA', city: 'Santa Marta', keywords: 'santa marta, magdalena, cienaga, fundacion', verifyUrl: 'www.ccsm.org.co', logoPosition: 'left' },
  { name: 'CÁMARA DE COMERCIO DE VILLAVICENCIO', city: 'Villavicencio', keywords: 'villavicencio, meta, acacias, granada', verifyUrl: 'www.ccv.org.co', logoPosition: 'left' },
  { name: 'CÁMARA DE COMERCIO DE PASTO', city: 'Pasto', keywords: 'pasto, narino, ipiales, tuquerres', verifyUrl: 'www.ccpasto.org.co', logoPosition: 'left' },
  { name: 'CÁMARA DE COMERCIO DE MONTERÍA', city: 'Montería', keywords: 'monteria, cordoba, cerete, lorica', verifyUrl: 'www.ccmonteria.org.co', logoPosition: 'left' },
  { name: 'CÁMARA DE COMERCIO DE NEIVA', city: 'Neiva', keywords: 'neiva, huila, pitalito, garzon', verifyUrl: 'www.ccneiva.org', logoPosition: 'left' },
  { name: 'CÁMARA DE COMERCIO DE VALLEDUPAR', city: 'Valledupar', keywords: 'valledupar, cesar, aguachica, agustin codazzi', verifyUrl: 'www.ccvalledupar.org.co', logoPosition: 'right' },
  { name: 'CÁMARA DE COMERCIO DE TUNJA', city: 'Tunja', keywords: 'tunja, boyaca, duitama, sogamoso', verifyUrl: 'www.cctunja.org.co', logoPosition: 'right' },
  { name: 'CÁMARA DE COMERCIO DE URABÁ', city: 'Apartadó', keywords: 'uraba, apartado, turbo, carepa, chigorodo', verifyUrl: 'www.ccuraba.org.co', logoPosition: 'right' },
  { name: 'CÁMARA DE COMERCIO DEL ORIENTE ANTIOQUEÑO', city: 'Rionegro', keywords: 'oriente antioqueno, rionegro, marinilla, la ceja, guarne', verifyUrl: 'www.ccoa.org.co', logoPosition: 'right' }
];

function matchChamberFromText(text) {
  if (!text) return null;
  const clean = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const chamber of COLOMBIAN_CHAMBERS_DIRECTORY) {
    const cityClean = chamber.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const kwList = chamber.keywords.split(',').map(k => k.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    if (clean.includes(cityClean) || kwList.some(k => clean.includes(k))) {
      return chamber;
    }
  }
  return null;
}

function analyzeCertificateHeader(imgElement) {
  const canvas = document.createElement('canvas');
  const targetWidth = 1000;
  const targetHeight = Math.round((imgElement.naturalHeight || imgElement.height || 1400) * (targetWidth / (imgElement.naturalWidth || imgElement.width || 1000)));
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(imgElement, 0, 0, targetWidth, targetHeight);

  const headerH = Math.min(Math.round(targetHeight * 0.24), 320);
  const leftX1 = Math.round(targetWidth * 0.02);
  const leftX2 = Math.round(targetWidth * 0.42);
  const rightX1 = Math.round(targetWidth * 0.58);
  const rightX2 = Math.round(targetWidth * 0.98);
  const centerX1 = Math.round(targetWidth * 0.30);
  const centerX2 = Math.round(targetWidth * 0.70);

  function getZoneMetrics(xStart, xEnd, yStart, yEnd) {
    const w = xEnd - xStart;
    const h = yEnd - yStart;
    if (w <= 0 || h <= 0) return { nonWhite: 0, chromaSum: 0, avgChroma: 0, bbox: null };
    const imgData = ctx.getImageData(xStart, yStart, w, h);
    const data = imgData.data;
    let nonWhite = 0;
    let chromaSum = 0;
    let minX = w, maxX = 0, minY = h, maxY = 0;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
        if (a < 50) continue;
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const chroma = Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
        if (lum < 240 || chroma > 25) {
          nonWhite++;
          chromaSum += chroma;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    return {
      nonWhite,
      chromaSum,
      avgChroma: nonWhite > 0 ? chromaSum / nonWhite : 0,
      bbox: minX <= maxX ? {
        x: xStart + minX,
        y: yStart + minY,
        w: maxX - minX + 1,
        h: maxY - minY + 1
      } : null
    };
  }

  const leftMetrics = getZoneMetrics(leftX1, leftX2, 10, headerH);
  const rightMetrics = getZoneMetrics(rightX1, rightX2, 10, headerH);
  const centerMetrics = getZoneMetrics(centerX1, centerX2, 10, Math.round(headerH * 0.55));

  let detectedPosition = 'right';
  let targetBbox = rightMetrics.bbox;

  const leftScore = (leftMetrics.chromaSum * 2) + leftMetrics.nonWhite;
  const rightScore = (rightMetrics.chromaSum * 2) + rightMetrics.nonWhite;

  if (centerMetrics.nonWhite > 300 && centerMetrics.avgChroma > 20 && Math.abs(leftMetrics.nonWhite - rightMetrics.nonWhite) < Math.max(leftMetrics.nonWhite, rightMetrics.nonWhite) * 0.3) {
    detectedPosition = 'center';
    targetBbox = centerMetrics.bbox;
  } else if (rightScore > leftScore * 1.35 || (rightMetrics.avgChroma > 22 && rightMetrics.avgChroma > leftMetrics.avgChroma * 1.3)) {
    detectedPosition = 'right';
    targetBbox = rightMetrics.bbox || { x: rightX1, y: 15, w: 180, h: 80 };
  } else if (leftScore > rightScore * 1.35 || (leftMetrics.avgChroma > 22 && leftMetrics.avgChroma > rightMetrics.avgChroma * 1.3)) {
    detectedPosition = 'left';
    targetBbox = leftMetrics.bbox || { x: leftX1, y: 15, w: 180, h: 80 };
  } else {
    detectedPosition = rightMetrics.nonWhite >= leftMetrics.nonWhite ? 'right' : 'left';
    targetBbox = (detectedPosition === 'right' ? rightMetrics.bbox : leftMetrics.bbox) || { x: 20, y: 20, w: 160, h: 70 };
  }

  let croppedLogoBase64 = null;
  if (targetBbox && targetBbox.w > 20 && targetBbox.h > 15) {
    const pad = 8;
    const cropX = Math.max(0, targetBbox.x - pad);
    const cropY = Math.max(0, targetBbox.y - pad);
    const cropW = Math.min(targetWidth - cropX, targetBbox.w + pad * 2);
    const cropH = Math.min(targetHeight - cropY, targetBbox.h + pad * 2);

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropW;
    cropCanvas.height = cropH;
    const cropCtx = cropCanvas.getContext('2d');
    cropCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    croppedLogoBase64 = cropCanvas.toDataURL('image/png');
  }

  return {
    position: detectedPosition,
    croppedLogo: croppedLogoBase64,
    bbox: targetBbox
  };
}

function initTemplateManager() {
  // Elementos de la sección de clonación inteligente
  const sampleTemplateInput = document.getElementById('sample-template-file');
  const sampleLogoInput = document.getElementById('sample-logo-file');
  const analysisPanel = document.getElementById('template-analysis-panel');
  const detectedPosBadge = document.getElementById('detected-pos-badge');
  const detectedLogoPreview = document.getElementById('detected-logo-preview');
  const detectedChamberNameInput = document.getElementById('detected-chamber-name');
  const detectedChamberCityInput = document.getElementById('detected-chamber-city');
  const btnCreateEditableCopy = document.getElementById('btn-create-editable-copy');
  const btnApplyToCustomForm = document.getElementById('btn-apply-to-custom-form');

  // Elementos del formulario manual
  const fileInput = document.getElementById('custom-logo-file');
  const previewBox = document.getElementById('custom-logo-preview-box');
  const previewImg = document.getElementById('custom-logo-preview-img');
  const saveBtn = document.getElementById('btn-save-custom-template');
  const resetBtn = document.getElementById('btn-reset-custom-form');
  const exportBtn = document.getElementById('btn-export-templates');
  const importBtn = document.getElementById('btn-import-templates');
  const inputImportJson = document.getElementById('input-import-json');

  // 1. Manejo de archivo de muestra para reconocimiento de plantilla
  sampleTemplateInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const matchedChamber = matchChamberFromText(file.name);
    const reader = new FileReader();
    reader.onload = function(evt) {
      currentSampleTemplateBase64 = evt.target.result;
      const img = new Image();
      img.onload = function() {
        const analysis = analyzeCertificateHeader(img);
        currentDetectedAnalysis = analysis;

        // Si el archivo del nombre o directorio sugiere una posición conocida, considerarla
        if (matchedChamber && matchedChamber.logoPosition) {
          analysis.position = matchedChamber.logoPosition;
        }

        const posText = analysis.position === 'center' ? '📍 Superior Centro' : (analysis.position === 'right' ? '📍 Superior Derecha' : '📍 Superior Izquierda');
        if (detectedPosBadge) detectedPosBadge.innerHTML = posText;

        if (detectedLogoPreview && analysis.croppedLogo && !currentUploadedLogoBase64) {
          detectedLogoPreview.src = analysis.croppedLogo;
        }

        if (detectedChamberNameInput) {
          detectedChamberNameInput.value = matchedChamber ? matchedChamber.name : (detectedChamberNameInput.value || 'CÁMARA DE COMERCIO');
        }

        if (detectedChamberCityInput) {
          detectedChamberCityInput.value = matchedChamber ? matchedChamber.city : (detectedChamberCityInput.value || 'COLOMBIA');
        }

        if (analysisPanel) analysisPanel.style.display = 'block';
        showToast(`✓ Plantilla analizada: Logo detectado en posición "${analysis.position.toUpperCase()}"`);
      };
      img.src = currentSampleTemplateBase64;
    };
    reader.readAsDataURL(file);
  });

  // 2. Manejo de archivo de logotipo en alta calidad para la clonación
  sampleLogoInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
      currentUploadedLogoBase64 = evt.target.result;
      if (detectedLogoPreview) detectedLogoPreview.src = currentUploadedLogoBase64;
      if (previewImg) previewImg.src = currentUploadedLogoBase64;
      if (previewBox) previewBox.style.display = 'block';
      showToast("✓ Logotipo en alta calidad vinculado a la plantilla.");
    };
    reader.readAsDataURL(file);
  });

  // 3. Crear copia exacta editable y abrir directamente en el generador
  btnCreateEditableCopy?.addEventListener('click', () => {
    const pos = currentDetectedAnalysis ? currentDetectedAnalysis.position : 'right';
    const logoData = currentUploadedLogoBase64 || (currentDetectedAnalysis ? currentDetectedAnalysis.croppedLogo : null);
    const chamberName = detectedChamberNameInput?.value.trim() || 'CÁMARA DE COMERCIO';
    const city = detectedChamberCityInput?.value.trim() || 'COLOMBIA';

    const matchedChamber = matchChamberFromText(city) || matchChamberFromText(chamberName);
    const templateId = 'custom_' + city.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now();

    const templateData = {
      id: templateId,
      name: chamberName,
      city: city,
      keywords: matchedChamber ? matchedChamber.keywords : city.toLowerCase(),
      verifyUrl: matchedChamber ? matchedChamber.verifyUrl : 'www.confecamaras.org.co',
      disclaimer: matchedChamber?.disclaimer || null,
      logoPosition: pos,
      logoBase64: logoData,
      isCustom: true
    };

    StorageManager.saveCustomTemplate(templateData);
    populateChamberDropdown();
    renderCustomTemplatesTable();
    useCustomTemplate(templateId);

    showToast(`⚡ ¡Copia exacta creada! Plantilla lista y editable en el Generador.`);
  });

  // 4. Copiar datos al formulario avanzado de plantillas
  btnApplyToCustomForm?.addEventListener('click', () => {
    const pos = currentDetectedAnalysis ? currentDetectedAnalysis.position : 'right';
    const chamberName = detectedChamberNameInput?.value.trim() || '';
    const city = detectedChamberCityInput?.value.trim() || '';
    const matchedChamber = matchChamberFromText(city) || matchChamberFromText(chamberName);

    const nameInput = document.getElementById('custom-name');
    const cityInput = document.getElementById('custom-city');
    const kwInput = document.getElementById('custom-keywords');
    const urlInput = document.getElementById('custom-verify-url');

    if (nameInput) nameInput.value = chamberName;
    if (cityInput) cityInput.value = city;
    if (kwInput) kwInput.value = matchedChamber ? matchedChamber.keywords : city.toLowerCase();
    if (urlInput) urlInput.value = matchedChamber ? matchedChamber.verifyUrl : 'www.confecamaras.org.co';

    const radio = document.querySelector(`input[name="custom-logo-pos"][value="${pos}"]`);
    if (radio) radio.checked = true;

    const logoData = currentUploadedLogoBase64 || (currentDetectedAnalysis ? currentDetectedAnalysis.croppedLogo : null);
    if (logoData) {
      currentUploadedLogoBase64 = logoData;
      if (previewImg) previewImg.src = logoData;
      if (previewBox) previewBox.style.display = 'block';
    }

    document.getElementById('custom-template-form')?.scrollIntoView({ behavior: 'smooth' });
    showToast("Datos copiados al editor avanzado de plantillas.");
  });

  // 5. Vista previa al cargar logotipo en el formulario manual
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

  // 6. Guardar nueva plantilla desde formulario manual
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

  // 7. Exportar e importar plantillas JSON
  exportBtn?.addEventListener('click', () => {
    StorageManager.exportTemplatesJSON();
    showToast("Archivo JSON de plantillas descargado.");
  });

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

    const posLabel = item.logoPosition === 'center' ? 'Sup. Centro' : (item.logoPosition === 'right' ? 'Sup. Derecha' : 'Sup. Izquierda');

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
        <td><span style="font-size:12px; font-weight:600;">${posLabel}</span></td>
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
