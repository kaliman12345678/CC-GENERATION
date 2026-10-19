/**
 * Catálogo Oficial de Cámaras de Comercio y Configuración Dinámica de Estilos
 */

const BUILTIN_CHAMBERS = {
  bucaramanga: {
    id: 'bucaramanga',
    name: 'Cámara de Comercio de Bucaramanga',
    styleId: 'bucaramanga',
    logoPosition: 'right',
    city: 'Bucaramanga',
    logoKey: 'bucaramanga',
    verifyUrl: 'WWW.CAMARADIRECTA.COM',
    keywords: ['bucaramanga', 'santander', 'floridablanca', 'giron', 'piedecuesta', 'barrancabermeja', 'san gil']
  },
  barranquilla: {
    id: 'barranquilla',
    name: 'Cámara de Comercio de Barranquilla',
    styleId: 'barranquilla',
    logoPosition: 'left',
    city: 'Barranquilla',
    logoKey: 'barranquilla',
    verifyUrl: 'www.camarabaq.org.co/',
    keywords: ['barranquilla', 'atlantico', 'soledad', 'malambo', 'puerto colombia']
  },
  medellin: {
    id: 'medellin',
    name: 'Cámara de Comercio de Medellín para Antioquia',
    styleId: 'medellin',
    logoPosition: 'right',
    city: 'Medellín',
    logoKey: 'medellin',
    verifyUrl: 'www.certificadoscamara.com',
    keywords: ['medellin', 'antioquia', 'envigado', 'bello', 'itagui', 'sabaneta', 'caldas antioquia']
  },
  cartagena: {
    id: 'cartagena',
    name: 'Cámara de Comercio de Cartagena',
    styleId: 'cartagena',
    logoPosition: 'left',
    city: 'Cartagena',
    logoKey: 'cartagena',
    verifyUrl: 'https://sii.confecamaras.co/vista/plantilla/cv.php?empresa=09',
    keywords: ['cartagena', 'bolivar', 'turbaco', 'arjona', 'magangue', 'el carmen de bolivar']
  },
  oriente_antioqueno: {
    id: 'oriente_antioqueno',
    name: 'Cámara de Comercio del Oriente Antioqueño',
    styleId: 'oriente_antioqueno',
    logoPosition: 'left',
    city: 'Rionegro',
    logoKey: 'oriente_antioqueno',
    verifyUrl: 'https://sii.confecamaras.co/vista/plantilla/cv.php?empresa=51',
    keywords: ['oriente', 'rionegro', 'marinilla', 'el carmen de viboral', 'la ceja', 'guarne', 'el retiro', 'santuario']
  },
  cali: {
    id: 'cali',
    name: 'Cámara de Comercio de Cali',
    styleId: 'cali',
    logoPosition: 'left',
    city: 'Cali',
    logoKey: 'cali',
    verifyUrl: 'www.ccc.org.co',
    keywords: ['cali', 'jamundi', 'yumbo', 'palmira', 'valle', 'candelaria', 'dagua']
  },
  manizales: {
    id: 'manizales',
    name: 'Cámara de Comercio de Manizales por Caldas',
    styleId: 'manizales',
    logoPosition: 'right',
    city: 'Manizales',
    logoKey: 'manizales',
    verifyUrl: 'www.ccm.org.co',
    keywords: ['manizales', 'caldas', 'chinchina', 'villamaria', 'neira']
  },
  uraba: {
    id: 'uraba',
    name: 'Cámara de Comercio de Urabá',
    styleId: 'uraba',
    logoPosition: 'right',
    city: 'Apartadó / Urabá',
    logoKey: 'uraba',
    verifyUrl: 'www.ccuraba.org.co',
    keywords: ['uraba', 'apartado', 'turbo', 'carepa', 'chigorodo', 'necocli']
  }
};

/**
 * Obtener catálogo unificado (Cámaras del sistema + Plantillas personalizadas agregadas por el usuario)
 */
function getUnifiedChamberCatalog() {
  const unified = { ...BUILTIN_CHAMBERS };
  
  if (typeof StorageManager !== 'undefined' && StorageManager.getCustomTemplates) {
    const customList = StorageManager.getCustomTemplates();
    customList.forEach(custom => {
      unified[custom.id] = {
        id: custom.id,
        name: custom.name || 'Nueva Cámara',
        styleId: 'custom',
        logoPosition: custom.logoPosition || 'left',
        city: custom.city || 'Ciudad',
        logoBase64: custom.logoBase64,
        verifyUrl: custom.verifyUrl || 'www.confecamaras.org.co',
        disclaimer: custom.disclaimer,
        lawIntro: custom.lawIntro,
        keywords: (custom.keywords || custom.city || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean),
        isCustom: true
      };
    });
  }
  
  return unified;
}

const CHAMBER_CATALOG = BUILTIN_CHAMBERS;

/**
 * Buscar cámara por ciudad en el catálogo unificado
 */
function getChamberByCity(cityName) {
  const catalog = getUnifiedChamberCatalog();
  if (!cityName) return catalog.bucaramanga || Object.values(catalog)[0];

  const normalized = cityName.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 1. Coincidencia por palabra clave
  for (const chamber of Object.values(catalog)) {
    if (chamber.keywords && chamber.keywords.some(k => normalized.includes(k))) {
      return chamber;
    }
  }

  // 2. Coincidencia por ID o nombre de ciudad
  for (const [id, chamber] of Object.entries(catalog)) {
    if (normalized.includes(id) || (chamber.city && normalized.includes(chamber.city.toLowerCase()))) {
      return chamber;
    }
  }

  return catalog.bucaramanga || Object.values(catalog)[0];
}

/**
 * Obtener imagen del logo en base64 (soporta tanto del sistema como subidos por el usuario)
 */
function getChamberLogoSrc(chamber) {
  if (chamber.logoBase64) {
    return chamber.logoBase64;
  }
  if (typeof OFFICIAL_LOGOS_BASE64 !== 'undefined' && OFFICIAL_LOGOS_BASE64[chamber.logoKey]) {
    return OFFICIAL_LOGOS_BASE64[chamber.logoKey];
  }
  return `assets/logos/logo-${chamber.logoKey || 'cali'}.png`;
}
