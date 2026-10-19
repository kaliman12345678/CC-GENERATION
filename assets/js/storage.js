/**
 * Módulo de Almacenamiento e Historial de Documentos Generados y Plantillas Personalizadas
 */

const StorageManager = {
  STORAGE_KEY: 'CREADOR_CC_HISTORIAL',
  TEMPLATES_KEY: 'CREADOR_CC_CUSTOM_TEMPLATES',

  /**
   * Obtiene todos los registros guardados en el historial
   */
  getAll() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error al leer historial:", e);
      return [];
    }
  },

  /**
   * Guarda o actualiza un registro en el historial
   */
  save(documentData, generatedFilename) {
    const records = this.getAll();
    const id = documentData.id || 'CC_' + Date.now();
    const now = new Date().toISOString();

    const record = {
      ...documentData,
      id: id,
      filename: generatedFilename || PDFGenerator.generateFileName(documentData),
      fechaGenerado: now,
      fechaLegible: new Date().toLocaleString('es-CO')
    };

    const index = records.findIndex(r => r.id === id);
    if (index >= 0) {
      records[index] = record;
    } else {
      records.unshift(record);
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn("Límite de almacenamiento alcanzado:", e);
    }

    return record;
  },

  getById(id) {
    const records = this.getAll();
    return records.find(r => r.id === id) || null;
  },

  delete(id) {
    const records = this.getAll().filter(r => r.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    return records;
  },

  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
  },

  // =========================================================================
  // GESTIÓN DE PLANTILLAS Y LOGOS PERSONALIZADOS (SIN TOCAR CÓDIGO)
  // =========================================================================

  /**
   * Obtiene las plantillas personalizadas agregadas por el usuario desde la web
   */
  getCustomTemplates() {
    try {
      const data = localStorage.getItem(this.TEMPLATES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error al leer plantillas personalizadas:", e);
      return [];
    }
  },

  /**
   * Guarda o actualiza una plantilla personalizada con su logotipo
   */
  saveCustomTemplate(template) {
    const templates = this.getCustomTemplates();
    const id = template.id || 'custom_' + Date.now();
    const newTemplate = {
      ...template,
      id: id,
      isCustom: true,
      fechaCreacion: new Date().toLocaleString('es-CO')
    };

    const idx = templates.findIndex(t => t.id === id);
    if (idx >= 0) {
      templates[idx] = newTemplate;
    } else {
      templates.push(newTemplate);
    }

    localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(templates));
    return newTemplate;
  },

  /**
   * Elimina una plantilla personalizada
   */
  deleteCustomTemplate(id) {
    const templates = this.getCustomTemplates().filter(t => t.id !== id);
    localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(templates));
    return templates;
  },

  /**
   * Exporta las plantillas personalizadas como archivo JSON descargable
   */
  exportTemplatesJSON() {
    const templates = this.getCustomTemplates();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(templates, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "plantillas_camaras_comercio.json");
    dlAnchor.click();
    dlAnchor.remove();
  },

  /**
   * Importa plantillas desde un archivo JSON
   */
  importTemplatesJSON(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      if (Array.isArray(imported)) {
        const existing = this.getCustomTemplates();
        const merged = [...existing];
        imported.forEach(item => {
          if (!merged.some(m => m.id === item.id)) {
            merged.push(item);
          }
        });
        localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(merged));
        return { success: true, count: imported.length };
      }
      return { success: false, error: "Formato no válido (debe ser una lista JSON)" };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};
