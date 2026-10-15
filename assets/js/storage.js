/**
 * Módulo de Almacenamiento e Historial de Documentos Generados (StorageManager)
 * Persiste los registros en LocalStorage para garantizar su conservación.
 */

const StorageManager = {
  STORAGE_KEY: 'CREADOR_CC_HISTORIAL',

  /**
   * Obtiene todos los registros guardados
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

    // Si ya existe un registro con el mismo ID, actualizarlo; si no, agregarlo al inicio
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

  /**
   * Obtiene un registro por su ID
   */
  getById(id) {
    const records = this.getAll();
    return records.find(r => r.id === id) || null;
  },

  /**
   * Elimina un registro por su ID
   */
  delete(id) {
    const records = this.getAll().filter(r => r.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    return records;
  },

  /**
   * Limpia todo el historial
   */
  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
};
