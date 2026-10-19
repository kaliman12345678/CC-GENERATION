/**
 * Motor de Renderizado Multi-Estilo de Cámaras de Comercio de Colombia
 * Calibrado con fidelidad visual 1:1 contra las fotos originales proporcionadas por el usuario:
 * 1. Bucaramanga (Logo sup. derecho, decretos 2150/1995 y 0427/1996, doble C E R T I F I C A)
 * 2. Barranquilla (Logo sup. izquierdo, línea guionada en código, formato INSCRIPCIÓN / UBICACIÓN)
 * 3. Medellín (Logo sup. derecho, recuadro guionado doble, tabla de dos columnas espaciada)
 * 4. Cartagena (Logo sup. izquierdo tres ondas, confecamaras empresa=09, desglose con Barrio)
 * 5. Cali (Logo sup. izquierdo concéntrico, banner de renovación, estructura de MATRÍCULA)
 */

const TemplateEngine = {
  generateVerificationCode(chamberId = 'bucaramanga') {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let code = '';
    const prefix = chamberId === 'bucaramanga' ? 'E2UW20' :
                   chamberId === 'barranquilla' ? 'JD637AA' :
                   chamberId === 'cartagena' ? 'X9Pf2gn' :
                   chamberId === 'medellin' ? 'UodLIyisnl' : '08234BB';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix + code;
  },

  generateReceiptNumber(chamberId = 'bucaramanga') {
    if (chamberId === 'cartagena') return 'S0121' + Math.floor(10000 + Math.random() * 90000);
    if (chamberId === 'medellin') return '003045' + Math.floor(1000 + Math.random() * 9000);
    if (chamberId === 'barranquilla') return '1273' + Math.floor(1000 + Math.random() * 9000);
    if (chamberId === 'cali') return '8414' + Math.floor(100 + Math.random() * 900);
    return '1032' + Math.floor(1000 + Math.random() * 9000);
  },

  formatDateByChamber(chamberId = 'bucaramanga', date = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());

    if (chamberId === 'bucaramanga') {
      return `${y}/${m}/${d} HORA: ${hh}:${mm}:${ss}`;
    }
    if (chamberId === 'medellin') {
      const ampm = date.getHours() >= 12 ? 'AM' : 'PM';
      let h12 = date.getHours() % 12;
      h12 = h12 ? h12 : 12;
      return `${d}/${m}/${y} - ${pad(h12)}:${mm}:${ss} ${ampm}`;
    }
    if (chamberId === 'cali') {
      const ampm = date.getHours() >= 12 ? 'pm' : 'am';
      let h12 = date.getHours() % 12;
      h12 = h12 ? h12 : 12;
      return `${d}/${m}/${y} ${pad(h12)}:${mm}:${ss} ${ampm}`;
    }
    return `${d}/${m}/${y} - ${hh}:${mm}:${ss}`;
  },

  /**
   * =========================================================================
   * 1. ESTILO CÁMARA DE COMERCIO DE BUCARAMANGA (IDÉNTICO A LA FOTO)
   * =========================================================================
   */
  renderBucaramanga(data) {
    const chamber = CHAMBER_CATALOG.bucaramanga;
    const logoSrc = getChamberLogoSrc(chamber);
    const fecha = data.fechaExpedicion || this.formatDateByChamber('bucaramanga');
    const recibo = data.reciboNo || this.generateReceiptNumber('bucaramanga');
    const codigo = data.codigoVerificacion || this.generateVerificationCode('bucaramanga');
    const razon = (data.razonSocial || 'COOPERATIVA DE CAFICULTORES DE SANTANDER LTDA.').toUpperCase();

    return `
      <div class="cc-page style-bucaramanga">
        <div class="bga-header-grid">
          <div class="bga-header-left">
            <div class="bga-main-title">CÁMARA DE COMERCIO DE BUCARAMANGA</div>
            <div class="bga-sub">CERTIFICADO GENERADO A TRAVÉS DE PLATAFORMA VIRTUAL</div>
            <div class="bga-meta">LUGAR Y FECHA DE EXPEDICIÓN: BUCARAMANGA, ${fecha}</div>
            <div class="bga-receipt">${recibo}</div>
            <div class="bga-code">CÓDIGO DE VERIFICACIÓN: ${codigo}</div>
          </div>
          <div class="bga-header-right">
            <img src="${logoSrc}" alt="Cámara de Comercio de Bucaramanga" class="bga-logo-img">
          </div>
        </div>

        <div class="dashed-separator">-------------------------------------------------------------------------------------------------------------------</div>
        <div class="bga-disclaimer">
          LA PERSONA O ENTIDAD A LA QUE USTED LE VA A ENTREGAR EL CERTIFICADO PUEDE VERIFICAR EL CONTENIDO Y CONFIABILIDAD, INGRESANDO A WWW.CAMARADIRECTA.COM OPCIÓN CERTIFICADOS ELECTRONICOS Y DIGITANDO EL CÓDIGO DE VERIFICACIÓN CITADO EN EL ENCABEZADO. ESTE CERTIFICADO, QUE PODRÁ SER VALIDADO DE MANERA ILIMITADA, DURANTE 60 DIAS CALENDARIO CONTADOS A PARTIR DE LA FECHA DE SU EXPEDICIÓN, CORRESPONDE A LA IMAGEN Y CONTENIDO DEL CERTIFICADO CREADO EN EL MOMENTO EN QUE SE GENERÓ EN LAS VENTANILLAS O A TRAVÉS DE LA PLATAFORMA VIRTUAL DE LA CÁMARA.
        </div>
        <div class="dashed-separator">-------------------------------------------------------------------------------------------------------------------</div>

        <div class="bga-cert-title">
          CERTIFICADO DE EXISTENCIA Y REPRESENTACION LEGAL ENTIDAD SIN ANIMO DE LUCRO DE:<br>
          ${razon}
        </div>

        <div class="bga-row-simple">ESTADO MATRICULA: ACTIVO</div>

        <div class="bga-law-intro">
          EL SECRETARIO DE LA CAMARA DE COMERCIO DE BUCARAMANGA, EN EJERCICIO DE LAS FACULTADES CONFERIDAS POR LOS ARTICULOS 43 Y 144 DEL DECRETO 2150 DE 1.995, DECRETO 0427 DE 1.996 Y CON FUNDAMENTO EN LAS INSCRIPCIONES REALIZADAS POR LA ENTIDAD.
        </div>

        <div class="centered-spaced-title">C E R T I F I C A</div>

        <div class="bga-meta-group">
          <div>FECHA DE RENOVACIÓN: ${data.fechaRenovacion || 'MARZO 15 DE 2022'}</div>
          <div>GRUPO NIIF: ${data.grupoNiif || 'GRUPO II.'}</div>
        </div>

        <div class="centered-spaced-title">C E R T I F I C A</div>

        <div class="bga-record-block">
          <div>REGISTRO: ${data.matricula || '05-500460-21 DEL 1997/02/17'}</div>
          <div>NOMBRE:${razon}</div>
          <div>NIT: ${data.nit || '890201988-3'}</div>
          <br>
          <div>DOMICILIO: ${(data.ciudad || 'SAN GIL').toUpperCase()}</div>
          <br>
          <div class="bga-table-lines">
            <div class="bga-line-item"><span class="bga-lbl">DIRECCION :</span> <span class="bga-val">${data.direccion || 'CR. 12 NO. 9-44'}</span></div>
            <div class="bga-line-item"><span class="bga-lbl">MUNICIPIO :</span> <span class="bga-val">${(data.ciudadCompleta || 'SAN GIL - SANTANDER').toUpperCase()}</span></div>
            <div class="bga-line-item"><span class="bga-lbl">TELEFONO1:</span> <span class="bga-val">${data.telefono || '7242556'}</span></div>
            <div class="bga-line-item"><span class="bga-lbl">TELEFONO2:</span> <span class="bga-val">${data.telefono2 || '3143824057'}</span></div>
            <div class="bga-line-item"><span class="bga-lbl">EMAIL :</span> <span class="bga-val">${data.email || 'secretaria@coopsantander.com'}</span></div>
          </div>
          <br>
          <div class="bga-bold-sub">NOTIFICACION JUDICIAL</div>
          <div class="bga-table-lines">
            <div class="bga-line-item"><span class="bga-lbl">DIRECCION:</span> <span class="bga-val">${data.direccionJudicial || data.direccion || 'CR. 12 NO. 9-44'}</span></div>
            <div class="bga-line-item"><span class="bga-lbl">MUNICIPIO:</span> <span class="bga-val">${(data.municipioJudicial || 'SAN GIL - SANTANDER').toUpperCase()}</span></div>
            <div class="bga-line-item"><span class="bga-lbl">TELEFONO1:</span> <span class="bga-val">${data.telefonoJudicial || data.telefono || '7242556'}</span></div>
            <div class="bga-line-item"><span class="bga-lbl">TELEFONO2:</span> <span class="bga-val">${data.telefonoJudicial2 || '3143824057'}</span></div>
            <div class="bga-line-item"><span class="bga-lbl">EMAIL :</span> <span class="bga-val">${data.emailNotificacion || data.email || 'secretaria@coopsantander.com'}</span></div>
          </div>
        </div>

        <div class="bga-footer-law">
          QUE POR CERTIFICADO DE EXISTENCIA No 410 DE FECHA 1968/12/10 DE LA DEPARTAMENTO ADMINISTRATIVO NAL. DE COOPERATIVAS DE BUCARAMANGA INSCRITA EN ESTA CAMARA DE COMERCIO EL 1997/02/17 BAJO EL No 565 DEL LIBRO 1, SE REGISTRO
        </div>
      </div>
    `;
  },

  /**
   * =========================================================================
   * 2. ESTILO CÁMARA DE COMERCIO DE BARRANQUILLA (IDÉNTICO A LA FOTO)
   * =========================================================================
   */
  renderBarranquilla(data) {
    const chamber = CHAMBER_CATALOG.barranquilla;
    const logoSrc = getChamberLogoSrc(chamber);
    const fecha = data.fechaExpedicion || this.formatDateByChamber('barranquilla');
    const recibo = data.reciboNo || '12739387';
    const codigo = data.codigoVerificacion || this.generateVerificationCode('barranquilla');

    return `
      <div class="cc-page style-barranquilla">
        <div class="baq-header">
          <div class="baq-logo-box">
            <img src="${logoSrc}" alt="Cámara de Comercio de Barranquilla" class="baq-logo-img">
          </div>
          <div class="baq-title-box">
            <div class="baq-name">Cámara de Comercio de Barranquilla</div>
            <div class="baq-cert-type">CERTIFICADO DE EXISTENCIA Y REPRESENTACION LEGAL<br>DE ENTIDADES SIN ANIMO DE LUCRO.</div>
            <div class="baq-date">Fecha de expedición: ${fecha}</div>
            <div class="baq-receipt">Recibo No. ${recibo}, Valor: 11,600</div>
          </div>
        </div>

        <div class="baq-code-strip">-----------------CODIGO DE VERIFICACIÓN: ${codigo}-----------------</div>
        
        <div class="baq-disclaimer">
          Verifique el contenido y confiabilidad de este certificado, ingresando a www.camarabaq.org.co/ y digite el código, para que visualice la imagen generada al momento de su expedición. La verificación se puede realizar de manera ilimitada, durante 60 dias calendario contados a partir de la fecha de su expedición.
        </div>
        <div class="dashed-separator">-------------------------------------------------------------------------------------------------------------------</div>

        <div class="centered-spaced-title" style="margin: 18px 0 14px 0;">C E R T I F I C A</div>

        <div class="section-heading-centered">NOMBRE, IDENTIFICACIÓN Y DOMICILIO</div>
        <div class="standard-kv-list">
          <div class="kv-row"><span class="kv-k">Razón Social:</span></div>
          <div class="kv-row"><span class="kv-v" style="font-weight: normal; margin-left: 0;">${(data.razonSocial || 'FUNDACION ISRAAID COLOMBIA').toUpperCase()}</span></div>
          <div class="kv-row"><span class="kv-k">Sigla:</span> <span class="kv-v">${data.sigla || 'ISRAAID E ISRAAID COLOMBIA'}</span></div>
          <div class="kv-row"><span class="kv-k">Nit:</span> <span class="kv-v">${data.nit || '901.409.873 - 9'}</span></div>
          <div class="kv-row"><span class="kv-k">Domicilio Principal:</span> <span class="kv-v">${data.ciudad || 'Barranquilla'}</span></div>
        </div>

        <div class="section-heading-centered" style="margin-top: 18px;">INSCRIPCIÓN</div>
        <div class="standard-kv-list">
          <div class="kv-row"><span class="kv-k">Registro No.:</span> <span class="kv-v">${data.matricula || '18.048'}</span></div>
          <div class="kv-row"><span class="kv-k">Fecha de registro:</span> <span class="kv-v">${data.fechaMatricula || '10 de Sep/bre de 2020'}</span></div>
          <div class="kv-row"><span class="kv-k">Último año renovado:</span> <span class="kv-v">${data.ultimoAnoRenovado || '2025'}</span></div>
          <div class="kv-row"><span class="kv-k">Fecha de renovación del registro:</span> <span class="kv-v">${data.fechaRenovacion || '28 de Marzo de 2025'}</span></div>
          <div class="kv-row"><span class="kv-k">Grupo NIIF:</span> <span class="kv-v">${data.grupoNiif || '4. GRUPO III. Microempresas'}</span></div>
        </div>

        <div class="section-heading-centered" style="margin-top: 18px;">UBICACIÓN</div>
        <div class="standard-kv-list">
          <div class="kv-row"><span class="kv-k">Direccion domicilio principal:</span> <span class="kv-v">${data.direccion || 'CL 77 B No 57 - 103 OF 2303'}</span></div>
          <div class="kv-row"><span class="kv-k">Municipio:</span> <span class="kv-v">${data.ciudadCompleta || 'Barranquilla - Atlantico'}</span></div>
          <div class="kv-row"><span class="kv-k">Correo electrónico:</span> <span class="kv-v">${data.email || 'kgarcia@israaid.org'}</span></div>
          <div class="kv-row"><span class="kv-k">Teléfono comercial 1:</span> <span class="kv-v">${data.telefono || '3354438'}</span></div>
          <div class="kv-row"><span class="kv-k">Teléfono comercial 2:</span> <span class="kv-v">${data.telefono2 || 'No reportó'}</span></div>
          <div class="kv-row"><span class="kv-k">Teléfono comercial 3:</span> <span class="kv-v">${data.telefono3 || 'No reportó'}</span></div>
          <br>
          <div class="kv-row"><span class="kv-k">Direccion para notificación judicial:</span> <span class="kv-v">${data.direccionJudicial || data.direccion || 'CL 77 B No 57 - 103 OF 2303'}</span></div>
          <div class="kv-row"><span class="kv-k">Municipio:</span> <span class="kv-v">${data.municipioJudicial || 'Barranquilla - Atlantico'}</span></div>
          <div class="kv-row"><span class="kv-k">Correo electrónico de notificación:</span> <span class="kv-v">${data.emailNotificacion || data.email || 'kgarcia@israaid.org'}</span></div>
          <div class="kv-row"><span class="kv-k">Teléfono para notificación 1:</span> <span class="kv-v">${data.telefonoJudicial || data.telefono || '3354438'}</span></div>
          <div class="kv-row"><span class="kv-k">Teléfono para notificación 2:</span> <span class="kv-v">${data.telefonoJudicial2 || 'No reportó'}</span></div>
          <div class="kv-row"><span class="kv-k">Teléfono para notificación 3:</span> <span class="kv-v">No reportó</span></div>
        </div>

        <div class="ctg-footer-pagination" style="margin-top: 35px;">
          Página 1 de 5
        </div>
      </div>
    `;
  },

  /**
   * =========================================================================
   * 3. ESTILO CÁMARA DE COMERCIO DE MEDELLÍN PARA ANTIOQUIA (IDÉNTICO A LA FOTO)
   * =========================================================================
   */
  renderMedellin(data) {
    const chamber = CHAMBER_CATALOG.medellin;
    const logoSrc = getChamberLogoSrc(chamber);
    const fecha = data.fechaExpedicion || this.formatDateByChamber('medellin');
    const recibo = data.reciboNo || '0030458833';
    const codigo = data.codigoVerificacion || this.generateVerificationCode('medellin');

    return `
      <div class="cc-page style-medellin">
        <div class="med-header-grid">
          <div class="med-header-center">
            <div class="med-name">Cámara de Comercio de Medellín para Antioquia</div>
            <div class="med-title">CERTIFICADO DE EXISTENCIA Y REPRESENTACIÓN LEGAL</div>
            <div class="med-date">Fecha de expedición: ${fecha}</div>
            <div class="med-receipt">Recibo No.: ${recibo} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Valor: $00</div>
            <div class="med-code">CÓDIGO DE VERIFICACIÓN: ${codigo}</div>
          </div>
          <div class="med-header-right">
            <img src="${logoSrc}" alt="Cámara de Comercio de Medellín" class="med-logo-img">
          </div>
        </div>

        <div class="dashed-separator">-----------------------------------------------------------------------------------------------------------------</div>
        <div class="med-disclaimer">
          Verifique el contenido y confiabilidad de este certificado, ingresando a www.certificadoscamara.com y digite el respectivo código, para que visualice la imagen generada al momento de su expedición. La verificación se puede realizar de manera ilimitada, durante 60 días calendario, contados a partir de la fecha de su expedición.
        </div>
        <div class="dashed-separator">-----------------------------------------------------------------------------------------------------------------</div>

        <div class="med-intro-cert">
          CON FUNDAMENTO EN LAS INSCRIPCIONES EFECTUADAS EN EL REGISTRO DE ENTIDADES SIN ÁNIMO DE LUCRO, LA CÁMARA DE COMERCIO CERTIFICA:
        </div>

        <div class="section-heading-centered" style="margin-top: 15px;">NOMBRE, IDENTIFICACIÓN Y DOMICILIO</div>
        <div class="med-table-rows">
          <div class="med-row"><span class="med-lbl">Razón social:</span> <span class="med-val">${(data.razonSocial || 'CORPORACION MAKAIA ASESORIA INTERNACIONAL').toUpperCase()}</span></div>
          <div class="med-row"><span class="med-lbl">Sigla:</span> <span class="med-val">${data.sigla || 'No reportó'}</span></div>
          <div class="med-row"><span class="med-lbl">Nit:</span> <span class="med-val">${data.nit || '900106664-1'}</span></div>
          <div class="med-row"><span class="med-lbl">Domicilio principal:</span> <span class="med-val">${(data.ciudadCompleta || 'MEDELLÍN, ANTIOQUIA, COLOMBIA').toUpperCase()}</span></div>
        </div>

        <div class="section-heading-centered" style="margin-top: 15px;">INSCRIPCION</div>
        <div class="med-table-rows">
          <div class="med-row"><span class="med-lbl">Inscripción No.:</span> <span class="med-val">${data.matricula || '21-009711-21'}</span></div>
          <div class="med-row"><span class="med-lbl">Fecha inscripción:</span> <span class="med-val">${data.fechaMatricula || '08 de Septiembre de 2006'}</span></div>
          <div class="med-row"><span class="med-lbl">Último año renovado:</span> <span class="med-val">${data.ultimoAnoRenovado || '2026'}</span></div>
          <div class="med-row"><span class="med-lbl">Fecha de renovación:</span> <span class="med-val">${data.fechaRenovacion || '19 de Marzo de 2026'}</span></div>
          <div class="med-row"><span class="med-lbl">Grupo NIIF:</span> <span class="med-val">${data.grupoNiif || 'GRUPO III.'}</span></div>
        </div>

        <div class="section-heading-centered" style="margin-top: 15px;">UBICACIÓN</div>
        <div class="med-table-rows">
          <div class="med-row"><span class="med-lbl">Dirección del domicilio principal:</span> <span class="med-val">${data.direccion || 'Carrera 43 A 34 155 OF 701'}</span></div>
          <div class="med-row"><span class="med-lbl">Municipio:</span> <span class="med-val">${(data.ciudadCompleta || 'MEDELLÍN, ANTIOQUIA, COLOMBIA').toUpperCase()}</span></div>
          <div class="med-row"><span class="med-lbl">Correo electrónico:</span> <span class="med-val">${data.email || 'direccion.operaciones@makaia.org'}</span></div>
          <div class="med-row"><span class="med-lbl">Teléfono comercial 1:</span> <span class="med-val">${data.telefono || '4480374'}</span></div>
          <div class="med-row"><span class="med-lbl">Teléfono comercial 2:</span> <span class="med-val">${data.telefono2 || '3188022847'}</span></div>
          <div class="med-row"><span class="med-lbl">Teléfono comercial 3:</span> <span class="med-val">${data.telefono3 || '3117209148'}</span></div>
          <div class="med-row"><span class="med-lbl">Página web:</span> <span class="med-val">No reportó</span></div>
          <br>
          <div class="med-row"><span class="med-lbl">Dirección para notificación judicial:</span> <span class="med-val">${data.direccionJudicial || data.direccion || 'Carrera 43 A 34 155 OF 701'}</span></div>
          <div class="med-row"><span class="med-lbl">Municipio:</span> <span class="med-val">${(data.municipioJudicial || 'MEDELLÍN, ANTIOQUIA, COLOMBIA').toUpperCase()}</span></div>
          <div class="med-row"><span class="med-lbl">Correo electrónico de notificación:</span> <span class="med-val">${data.emailNotificacion || data.email || 'carlos.gonzalez@makaia.org'}</span></div>
          <div class="med-row"><span class="med-lbl">Teléfono para notificación 1:</span> <span class="med-val">${data.telefonoJudicial || data.telefono || '4480374'}</span></div>
          <div class="med-row"><span class="med-lbl">Teléfono para notificación 2:</span> <span class="med-val">${data.telefonoJudicial2 || '3188022847'}</span></div>
          <div class="med-row"><span class="med-lbl">Teléfono para notificación 3:</span> <span class="med-val">3113428926</span></div>
        </div>

        <div class="med-legal-bottom">
          La persona jurídica ${(data.razonSocial || 'CORPORACION MAKAIA ASESORIA INTERNACIONAL').toUpperCase()} SI autorizó para recibir notificaciones personales a través de correo electrónico, de conformidad con lo establecido en los artículos 291 del Código General del Proceso y 67 del Código de Procedimiento...
        </div>

        <div style="text-align: center; font-style: italic; font-weight: bold; font-size: 8pt; margin-top: 15px;">
          Página: 1 de 10
        </div>
      </div>
    `;
  },

  /**
   * =========================================================================
   * 4. ESTILO CÁMARA DE COMERCIO DE CARTAGENA (IDÉNTICO A LA FOTO)
   * =========================================================================
   */
  renderCartagena(data) {
    const chamber = CHAMBER_CATALOG.cartagena;
    const logoSrc = getChamberLogoSrc(chamber);
    const fecha = data.fechaExpedicion || this.formatDateByChamber('cartagena');
    const recibo = data.reciboNo || 'S012133722';
    const codigo = data.codigoVerificacion || this.generateVerificationCode('cartagena');

    return `
      <div class="cc-page style-cartagena">
        <div class="ctg-header">
          <div class="ctg-logo-box">
            <img src="${logoSrc}" alt="Cámara de Comercio de Cartagena" class="ctg-logo-img">
          </div>
          <div class="ctg-center-titles">
            <div class="ctg-main-name">CÁMARA DE COMERCIO DE CARTAGENA</div>
            <div class="ctg-sub-name">CERTIFICADO DE EXISTENCIA Y REPRESENTACIÓN LEGAL</div>
            <div class="ctg-meta">Fecha expedición: ${fecha}</div>
            <div class="ctg-receipt">Recibo No. ${recibo}, Valor 12100</div>
            <div class="ctg-code">CÓDIGO DE VERIFICACIÓN ${codigo}</div>
          </div>
        </div>

        <div class="ctg-disclaimer">
          Verifique el contenido y confiabilidad de este certificado, ingresando a https://sii.confecamaras.co/vista/plantilla/cv.php?empresa=09 y digite el respectivo código, para que visualice la imagen generada al momento de su expedición. La verificación se puede realizar de manera ilimitada, durante 60 días calendario contados a partir de la fecha de su expedición.
        </div>

        <div class="ctg-cert-intro">
          CON FUNDAMENTO EN LA MATRÍCULA E INSCRIPCIONES EFECTUADAS EN EL REGISTRO MERCANTIL, LA CÁMARA DE COMERCIO CERTIFICA:
        </div>

        <div class="section-heading-centered">NOMBRE, IDENTIFICACIÓN Y DOMICILIO</div>
        <div class="ctg-rows">
          <div class="ctg-row"><span class="ctg-lbl">Razón Social :</span> <span class="ctg-val">${(data.razonSocial || 'SPERCOL S.A.S').toUpperCase()}</span></div>
          <div class="ctg-row"><span class="ctg-lbl">Nit :</span> <span class="ctg-val">${data.nit || '901028458-1'}</span></div>
          <div class="ctg-row"><span class="ctg-lbl">Domicilio:</span> <span class="ctg-val">${data.ciudadCompleta || 'Cartagena, Bolivar'}</span></div>
        </div>

        <div class="section-heading-centered">MATRÍCULA</div>
        <div class="ctg-rows">
          <div class="ctg-row"><span class="ctg-lbl">Matrícula No:</span> <span class="ctg-val">${data.matricula || '36975512'}</span></div>
          <div class="ctg-row"><span class="ctg-lbl">Fecha de matrícula:</span> <span class="ctg-val">${data.fechaMatricula || '21 de noviembre de 2016'}</span></div>
          <div class="ctg-row"><span class="ctg-lbl">Ultimo año renovado:</span> <span class="ctg-val">${data.ultimoAnoRenovado || '2026'}</span></div>
          <div class="ctg-row"><span class="ctg-lbl">Fecha de renovación:</span> <span class="ctg-val">${data.fechaRenovacion || '31 de marzo de 2026'}</span></div>
          <div class="ctg-row"><span class="ctg-lbl">Grupo NIIF :</span> <span class="ctg-val">${data.grupoNiif || 'GRUPO III - MICROEMPRESAS'}</span></div>
        </div>

        <div class="section-heading-centered">UBICACIÓN</div>
        <div class="ctg-rows">
          <div class="ctg-row"><span class="ctg-lbl">Dirección del domicilio principal :</span> <span class="ctg-val">${data.direccion || 'BARRIO BOSQUE, TRANSVERSAL 54 Nro. 30 - 403, SANTILLANA DE LOS PATIOS'}</span></div>
          <div class="ctg-row"><span class="ctg-lbl">Barrio :</span> <span class="ctg-val">BOSQUE</span></div>
          <div class="ctg-row"><span class="ctg-lbl">Municipio :</span> <span class="ctg-val">${data.ciudadCompleta || 'Cartagena, Bolivar'}</span></div>
          <div class="ctg-row"><span class="ctg-lbl">Correo electrónico :</span> <span class="ctg-val">${data.email || 'spercol.sas@hotmail.com'}</span></div>
          <div class="ctg-row"><span class="ctg-lbl">Teléfono comercial 1 :</span> <span class="ctg-val">${data.telefono || '3504624532'}</span></div>
          <div class="ctg-row"><span class="ctg-lbl">Teléfono comercial 2 :</span> <span class="ctg-val">${data.telefono2 || '3107290100'}</span></div>
          <div class="ctg-row"><span class="ctg-lbl">Teléfono comercial 3 :</span> <span class="ctg-val">${data.telefono3 || '3108280913'}</span></div>
          <br>
          <div class="ctg-row"><span class="ctg-lbl">Dirección para notificación judicial :</span> <span class="ctg-val">${data.direccionJudicial || data.direccion || 'BARRIO BOSQUE, TRANSVERSAL 54 Nro. 30 - 403, SANTILLANA DE LOS PATIOS'}</span></div>
          <div class="ctg-row"><span class="ctg-lbl">Barrio :</span> <span class="ctg-val">BOSQUE</span></div>
          <div class="ctg-row"><span class="ctg-lbl">Municipio :</span> <span class="ctg-val">${data.municipioJudicial || 'Cartagena, Bolivar'}</span></div>
          <div class="ctg-row"><span class="ctg-lbl">Correo electrónico de notificación :</span> <span class="ctg-val">${data.emailNotificacion || data.email || 'spercol.sas@hotmail.com'}</span></div>
        </div>

        <div class="ctg-legal-notif">
          La persona jurídica <strong>SI</strong> autorizó para recibir notificaciones personales a través del correo electrónico, de conformidad con lo establecido en los artículos 291 del Código General del Proceso y del 67 del Código de Procedimiento Administrativo y de lo Contencioso Administrativo.
        </div>

        <div class="section-heading-centered" style="margin-top: 15px;">CONSTITUCIÓN</div>
        <div class="ctg-legal-notif">
          por documento privado del 18 de Noviembre de 2016 otorgado en Cartagena, inscrito en esta Cámara de Comercio el 21 de Noviembre de 2016 bajo el número 127545 del Libro IX del Registro Mercantil, se constituyó una sociedad por acciones simplificadas de
        </div>

        <div class="ctg-footer-pagination">
          Página 1 de 5
        </div>
      </div>
    `;
  },

  /**
   * =========================================================================
   * 5. ESTILO CÁMARA DE COMERCIO DE CALI (IDÉNTICO A LA FOTO)
   * =========================================================================
   */
  renderCali(data) {
    const chamber = CHAMBER_CATALOG.cali;
    const logoSrc = getChamberLogoSrc(chamber);
    const fecha = data.fechaExpedicion || this.formatDateByChamber('cali');
    const recibo = data.reciboNo || '8414394';
    const codigo = data.codigoVerificacion || this.generateVerificationCode('cali');
    const razon = (data.razonSocial || 'FUNDALIVIO S.A.S.').toUpperCase();

    return `
      <div class="cc-page style-cali-authentic">
        <div class="cali-header-flex">
          <div class="cali-logo-wrap">
            <img src="${logoSrc}" alt="Cámara de Comercio de Cali" class="cali-logo-img-auth">
          </div>
          <div class="cali-titles-wrap">
            <div class="cali-auth-name">Camara de Comercio de Cali</div>
            <div class="cali-auth-title">CERTIFICADO DE EXISTENCIA Y REPRESENTACIÓN LEGAL</div>
            <div class="cali-auth-date">Fecha expedición: ${fecha}</div>
            <div class="cali-auth-receipt">Recibo No. ${recibo}, Valor: $7.200</div>
            <div class="cali-auth-code">CODIGO DE VERIFICACIÓN: <strong>${codigo}</strong></div>
          </div>
        </div>

        <div class="cali-auth-disclaimer">
          Verifique el contenido y confiabilidad de este certificado, ingresando a www.ccc.org.co y digite el respectivo código, para que visualice la imagen generada al momento de su expedición. La verificación se puede realizar de manera ilimitada, durante 60 días calendario, contados a partir de la fecha de su expedición.
        </div>

        <div class="cali-auth-banner">
          LA MATRÍCULA MERCANTIL PROPORCIONA SEGURIDAD Y CONFIANZA EN LOS NEGOCIOS, RENUEVE EN WWW.CCC.ORG.CO. EL PLAZO PARA RENOVAR LA MATRÍCULA ES HASTA EL 31 DE MARZO DE 2023.
        </div>

        <div class="cali-auth-intro">
          CON FUNDAMENTO EN LA MATRÍCULA E INSCRIPCIONES EFECTUADAS EN EL REGISTRO MERCANTIL, LA CÁMARA DE COMERCIO CERTIFICA:
        </div>

        <div class="section-heading-centered" style="margin: 14px 0 8px 0;">NOMBRE, IDENTIFICACIÓN Y DOMICILIO</div>
        <div class="cali-table-auth">
          <div class="cali-row-auth"><span class="cali-lbl-auth">Razón social:</span> <span class="cali-val-auth">${razon}</span></div>
          <div class="cali-row-auth"><span class="cali-lbl-auth">Nit.:</span> <span class="cali-val-auth">${data.nit || '805019927-6'}</span></div>
          <div class="cali-row-auth"><span class="cali-lbl-auth">Domicilio principal:</span> <span class="cali-val-auth">${data.ciudad || 'Cali'}</span></div>
        </div>

        <div class="section-heading-centered" style="margin: 14px 0 8px 0;">MATRÍCULA</div>
        <div class="cali-table-auth">
          <div class="cali-row-auth"><span class="cali-lbl-auth">Matrícula No.:</span> <span class="cali-val-auth">${data.matricula || '559967-16'}</span></div>
          <div class="cali-row-auth"><span class="cali-lbl-auth">Fecha de matrícula en esta Cámara:</span> <span class="cali-val-auth">${data.fechaMatricula || '07 de mayo de 2001'}</span></div>
          <div class="cali-row-auth"><span class="cali-lbl-auth">Último año renovado:</span> <span class="cali-val-auth">${data.ultimoAnoRenovado || '2022'}</span></div>
          <div class="cali-row-auth"><span class="cali-lbl-auth">Fecha de renovación:</span> <span class="cali-val-auth">${data.fechaRenovacion || '16 de marzo de 2022'}</span></div>
          <div class="cali-row-auth"><span class="cali-lbl-auth">Grupo NIIF:</span> <span class="cali-val-auth">${data.grupoNiif || 'Grupo 2'}</span></div>
        </div>

        <div class="section-heading-centered" style="margin: 14px 0 8px 0;">UBICACIÓN</div>
        <div class="cali-table-auth">
          <div class="cali-row-auth"><span class="cali-lbl-auth">Dirección del domicilio principal:</span> <span class="cali-val-auth">${data.direccion || 'CL 19 NORTE # 5 - 35 CU 706 707 801'}</span></div>
          <div class="cali-row-auth"><span class="cali-lbl-auth">Municipio:</span> <span class="cali-val-auth">${data.ciudadCompleta || 'Cali - Valle'}</span></div>
          <div class="cali-row-auth"><span class="cali-lbl-auth">Correo electrónico:</span> <span class="cali-val-auth">${data.email || 'FUNDALIVIO@FUNDALIVIO.COM'}</span></div>
          <div class="cali-row-auth"><span class="cali-lbl-auth">Teléfono comercial 1:</span> <span class="cali-val-auth">${data.telefono || '6607742'}</span></div>
          <div class="cali-row-auth"><span class="cali-lbl-auth">Teléfono comercial 2:</span> <span class="cali-val-auth">${data.telefono2 || 'No reportó'}</span></div>
          <div class="cali-row-auth"><span class="cali-lbl-auth">Teléfono comercial 3:</span> <span class="cali-val-auth">${data.telefono3 || 'No reportó'}</span></div>
          <br>
          <div class="cali-row-auth"><span class="cali-lbl-auth">Dirección para notificación judicial:</span> <span class="cali-val-auth">${data.direccionJudicial || data.direccion || 'CL 19 NORTE # 5 - 35 CU 706 707 801'}</span></div>
          <div class="cali-row-auth"><span class="cali-lbl-auth">Municipio:</span> <span class="cali-val-auth">${data.municipioJudicial || 'Cali - Valle'}</span></div>
          <div class="cali-row-auth"><span class="cali-lbl-auth">Correo electrónico de notificación:</span> <span class="cali-val-auth">${data.emailNotificacion || data.email || 'FUNDALIVIO@FUNDALIVIO.COM'}</span></div>
          <div class="cali-row-auth"><span class="cali-lbl-auth">Teléfono para notificación 1:</span> <span class="cali-val-auth">${data.telefonoJudicial || data.telefono || '6607742'}</span></div>
          <div class="cali-row-auth"><span class="cali-lbl-auth">Teléfono para notificación 2:</span> <span class="cali-val-auth">${data.telefonoJudicial2 || 'No reportó'}</span></div>
          <div class="cali-row-auth"><span class="cali-lbl-auth">Teléfono para notificación 3:</span> <span class="cali-val-auth">No reportó</span></div>
        </div>

        <div class="cali-auth-legal">
          La persona jurídica ${razon} SI autorizó recibir notificaciones personales a través de correo electrónico, de conformidad con lo establecido en los artículos 291 del Código General del Proceso y 67 del Código de Procedimiento Administrativo y de lo Contencioso Administrativo.
        </div>
      </div>
    `;
  },

  /**
   * =========================================================================
   * 6. ESTILO CÁMARA DE COMERCIO DE MANIZALES POR CALDAS
   * =========================================================================
   */
  renderManizales(data) {
    const chamber = CHAMBER_CATALOG.manizales;
    const logoSrc = getChamberLogoSrc(chamber);
    const fecha = data.fechaExpedicion || this.formatDateByChamber('manizales');
    const recibo = data.reciboNo || '00492812';
    const codigo = data.codigoVerificacion || this.generateVerificationCode('manizales');
    const razon = (data.razonSocial || 'EMPRESA EJEMPLO S.A.S.').toUpperCase();

    return `
      <div class="cc-page style-manizales">
        <div class="bga-header-grid">
          <div class="bga-header-left">
            <div class="bga-main-title">CÁMARA DE COMERCIO DE MANIZALES POR CALDAS</div>
            <div class="bga-sub">CERTIFICADO DE EXISTENCIA Y REPRESENTACIÓN LEGAL</div>
            <div class="bga-meta">Fecha de expedición: ${fecha}</div>
            <div class="bga-receipt">Recibo No. ${recibo} &nbsp;&nbsp;&nbsp;&nbsp; Valor: $00</div>
            <div class="bga-code">CÓDIGO DE VERIFICACIÓN: <strong>${codigo}</strong></div>
          </div>
          <div class="bga-header-right">
            <img src="${logoSrc}" alt="Cámara de Comercio de Manizales" class="med-logo-img">
          </div>
        </div>

        <div class="dashed-separator">-------------------------------------------------------------------------------------------------------------------</div>
        <div class="bga-disclaimer">
          Verifique el contenido y confiabilidad de este certificado, ingresando a www.ccm.org.co y digite el respectivo código, para que visualice la imagen generada al momento de su expedición. La verificación se puede realizar de manera ilimitada, durante 60 días calendario contados a partir de la fecha de su expedición.
        </div>
        <div class="dashed-separator">-------------------------------------------------------------------------------------------------------------------</div>

        <div class="ctg-cert-intro">
          CON FUNDAMENTO EN LA MATRÍCULA E INSCRIPCIONES EFECTUADAS EN EL REGISTRO MERCANTIL, LA CÁMARA DE COMERCIO CERTIFICA:
        </div>

        <div class="section-heading-centered">NOMBRE, IDENTIFICACIÓN Y DOMICILIO</div>
        <div class="standard-kv-list">
          <div class="kv-row"><span class="kv-k">Razón Social:</span> <span class="kv-v">${razon}</span></div>
          <div class="kv-row"><span class="kv-k">Nit:</span> <span class="kv-v">${data.nit || '900.123.456-7'}</span></div>
          <div class="kv-row"><span class="kv-k">Domicilio Principal:</span> <span class="kv-v">${data.ciudadCompleta || 'Manizales - Caldas'}</span></div>
        </div>

        <div class="section-heading-centered">MATRÍCULA / INSCRIPCIÓN</div>
        <div class="standard-kv-list">
          <div class="kv-row"><span class="kv-k">Matrícula No.:</span> <span class="kv-v">${data.matricula || '218392-16'}</span></div>
          <div class="kv-row"><span class="kv-k">Fecha de matrícula:</span> <span class="kv-v">${data.fechaMatricula || '12 de mayo de 2015'}</span></div>
          <div class="kv-row"><span class="kv-k">Último año renovado:</span> <span class="kv-v">${data.ultimoAnoRenovado || '2026'}</span></div>
          <div class="kv-row"><span class="kv-k">Fecha de renovación:</span> <span class="kv-v">${data.fechaRenovacion || '24 de marzo de 2026'}</span></div>
          <div class="kv-row"><span class="kv-k">Grupo NIIF:</span> <span class="kv-v">${data.grupoNiif || 'Grupo 2'}</span></div>
        </div>

        <div class="section-heading-centered">UBICACIÓN Y CONTACTO</div>
        <div class="standard-kv-list">
          <div class="kv-row"><span class="kv-k">Dirección domicilio principal:</span> <span class="kv-v">${data.direccion || 'CR 23 # 26-60 OF 402'}</span></div>
          <div class="kv-row"><span class="kv-k">Municipio:</span> <span class="kv-v">${data.ciudadCompleta || 'Manizales - Caldas'}</span></div>
          <div class="kv-row"><span class="kv-k">Correo electrónico:</span> <span class="kv-v">${data.email || 'gerencia@empresa.com.co'}</span></div>
          <div class="kv-row"><span class="kv-k">Teléfono comercial 1:</span> <span class="kv-v">${data.telefono || '8841234'}</span></div>
          <div class="kv-row"><span class="kv-k">Teléfono comercial 2:</span> <span class="kv-v">${data.telefono2 || 'No reportó'}</span></div>
          <br>
          <div class="kv-row"><span class="kv-k">Dirección notificación judicial:</span> <span class="kv-v">${data.direccionJudicial || data.direccion || 'CR 23 # 26-60 OF 402'}</span></div>
          <div class="kv-row"><span class="kv-k">Municipio:</span> <span class="kv-v">${data.municipioJudicial || 'Manizales - Caldas'}</span></div>
          <div class="kv-row"><span class="kv-k">Correo notificación judicial:</span> <span class="kv-v">${data.emailNotificacion || data.email || 'notificaciones@empresa.com.co'}</span></div>
          <div class="kv-row"><span class="kv-k">Teléfono para notificación:</span> <span class="kv-v">${data.telefonoJudicial || data.telefono || '8841234'}</span></div>
        </div>

        <div class="cali-auth-legal">
          La persona jurídica <strong>SI</strong> autorizó para recibir notificaciones personales a través de correo electrónico, de conformidad con lo establecido en los artículos 291 del Código General del Proceso y 67 del Código de Procedimiento Administrativo y de lo Contencioso Administrativo.
        </div>
      </div>
    `;
  },

  /**
   * =========================================================================
   * 7. ESTILO CÁMARA DE COMERCIO DE URABÁ
   * =========================================================================
   */
  renderUraba(data) {
    const chamber = CHAMBER_CATALOG.uraba;
    const logoSrc = getChamberLogoSrc(chamber);
    const fecha = data.fechaExpedicion || this.formatDateByChamber('uraba');
    const recibo = data.reciboNo || '00192837';
    const codigo = data.codigoVerificacion || this.generateVerificationCode('uraba');
    const razon = (data.razonSocial || 'EMPRESA URABA S.A.S.').toUpperCase();

    return `
      <div class="cc-page style-uraba">
        <div class="bga-header-grid">
          <div class="bga-header-left">
            <div class="bga-main-title">CÁMARA DE COMERCIO DE URABÁ</div>
            <div class="bga-sub">CERTIFICADO DE EXISTENCIA Y REPRESENTACIÓN LEGAL</div>
            <div class="bga-meta">Fecha de expedición: ${fecha}</div>
            <div class="bga-receipt">Recibo No. ${recibo}</div>
            <div class="bga-code">CÓDIGO DE VERIFICACIÓN: <strong>${codigo}</strong></div>
          </div>
          <div class="bga-header-right">
            <img src="${logoSrc}" alt="Cámara de Comercio de Urabá" class="med-logo-img">
          </div>
        </div>

        <div class="dashed-separator">-------------------------------------------------------------------------------------------------------------------</div>
        <div class="bga-disclaimer">
          Verifique el contenido y confiabilidad de este certificado, ingresando a www.ccuraba.org.co y digite el respectivo código, para que visualice la imagen generada al momento de su expedición. La verificación se puede realizar de manera ilimitada, durante 60 días calendario contados a partir de la fecha de su expedición.
        </div>
        <div class="dashed-separator">-------------------------------------------------------------------------------------------------------------------</div>

        <div class="ctg-cert-intro">
          CON FUNDAMENTO EN LA MATRÍCULA E INSCRIPCIONES EFECTUADAS EN EL REGISTRO MERCANTIL, LA CÁMARA DE COMERCIO CERTIFICA:
        </div>

        <div class="section-heading-centered">NOMBRE, IDENTIFICACIÓN Y DOMICILIO</div>
        <div class="standard-kv-list">
          <div class="kv-row"><span class="kv-k">Razón Social:</span> <span class="kv-v">${razon}</span></div>
          <div class="kv-row"><span class="kv-k">Nit:</span> <span class="kv-v">${data.nit || '900.876.543-2'}</span></div>
          <div class="kv-row"><span class="kv-k">Domicilio Principal:</span> <span class="kv-v">${data.ciudadCompleta || 'Apartadó - Antioquia'}</span></div>
        </div>

        <div class="section-heading-centered">MATRÍCULA / INSCRIPCIÓN</div>
        <div class="standard-kv-list">
          <div class="kv-row"><span class="kv-k">Matrícula No.:</span> <span class="kv-v">${data.matricula || '98721-16'}</span></div>
          <div class="kv-row"><span class="kv-k">Fecha de matrícula:</span> <span class="kv-v">${data.fechaMatricula || '18 de octubre de 2018'}</span></div>
          <div class="kv-row"><span class="kv-k">Último año renovado:</span> <span class="kv-v">${data.ultimoAnoRenovado || '2026'}</span></div>
          <div class="kv-row"><span class="kv-k">Fecha de renovación:</span> <span class="kv-v">${data.fechaRenovacion || '29 de marzo de 2026'}</span></div>
          <div class="kv-row"><span class="kv-k">Grupo NIIF:</span> <span class="kv-v">${data.grupoNiif || 'Grupo 2'}</span></div>
        </div>

        <div class="section-heading-centered">UBICACIÓN Y CONTACTO</div>
        <div class="standard-kv-list">
          <div class="kv-row"><span class="kv-k">Dirección domicilio principal:</span> <span class="kv-v">${data.direccion || 'CALLE 100 # 105-20'}</span></div>
          <div class="kv-row"><span class="kv-k">Municipio:</span> <span class="kv-v">${data.ciudadCompleta || 'Apartadó - Antioquia'}</span></div>
          <div class="kv-row"><span class="kv-k">Correo electrónico:</span> <span class="kv-v">${data.email || 'contacto@empresa.com.co'}</span></div>
          <div class="kv-row"><span class="kv-k">Teléfono comercial 1:</span> <span class="kv-v">${data.telefono || '8281234'}</span></div>
          <br>
          <div class="kv-row"><span class="kv-k">Dirección notificación judicial:</span> <span class="kv-v">${data.direccionJudicial || data.direccion || 'CALLE 100 # 105-20'}</span></div>
          <div class="kv-row"><span class="kv-k">Municipio:</span> <span class="kv-v">${data.municipioJudicial || 'Apartadó - Antioquia'}</span></div>
          <div class="kv-row"><span class="kv-k">Correo notificación judicial:</span> <span class="kv-v">${data.emailNotificacion || data.email || 'notificaciones@empresa.com.co'}</span></div>
          <div class="kv-row"><span class="kv-k">Teléfono para notificación:</span> <span class="kv-v">${data.telefonoJudicial || data.telefono || '8281234'}</span></div>
        </div>

        <div class="cali-auth-legal">
          La persona jurídica <strong>SI</strong> autorizó para recibir notificaciones personales a través de correo electrónico, de conformidad con lo establecido en los artículos 291 del Código General del Proceso y 67 del Código de Procedimiento Administrativo y de lo Contencioso Administrativo.
        </div>
      </div>
    `;
  },

  /**
   * =========================================================================
   * 8. ESTILO PERSONALIZADO DINÁMICO (CREADO DESDE EL GESTOR WEB)
   * =========================================================================
   */
  renderCustomChamber(data, chamber) {
    const logoSrc = getChamberLogoSrc(chamber);
    const fecha = data.fechaExpedicion || this.formatDateByChamber('bucaramanga');
    const recibo = data.reciboNo || this.generateReceiptNumber('bucaramanga');
    const codigo = data.codigoVerificacion || this.generateVerificationCode('bucaramanga');
    const isRight = chamber.logoPosition === 'right';

    const disclaimer = chamber.disclaimer || 
      `LA PERSONA O ENTIDAD A LA QUE USTED LE VA A ENTREGAR EL CERTIFICADO PUEDE VERIFICAR EL CONTENIDO Y CONFIABILIDAD, INGRESANDO A ${chamber.verifyUrl || 'WWW.CONFECAMARAS.ORG.CO'} Y DIGITANDO EL CÓDIGO DE VERIFICACIÓN CITADO EN EL ENCABEZADO. ESTE CERTIFICADO PODRÁ SER VALIDADO DE MANERA ILIMITADA DURANTE 60 DÍAS CALENDARIO A PARTIR DE SU EXPEDICIÓN.`;

    const lawIntro = chamber.lawIntro ||
      `CON FUNDAMENTO EN LA MATRÍCULA E INSCRIPCIONES EFECTUADAS EN EL REGISTRO MERCANTIL, LA CÁMARA DE COMERCIO CERTIFICA:`;

    const headerHtml = isRight ? `
      <div class="bga-header-grid">
        <div class="bga-header-left">
          <div class="bga-main-title">${(chamber.name || 'CÁMARA DE COMERCIO').toUpperCase()}</div>
          <div class="bga-sub">CERTIFICADO DE EXISTENCIA Y REPRESENTACIÓN LEGAL</div>
          <div class="bga-meta">LUGAR Y FECHA DE EXPEDICIÓN: ${(chamber.city || data.ciudad || 'COLOMBIA').toUpperCase()}, ${fecha}</div>
          <div class="bga-receipt">Recibo No. ${recibo}</div>
          <div class="bga-code">CÓDIGO DE VERIFICACIÓN: <strong>${codigo}</strong></div>
        </div>
        <div class="bga-header-right">
          <img src="${logoSrc}" alt="${chamber.name}" style="max-width: 175px; max-height: 75px; object-fit: contain;">
        </div>
      </div>
    ` : `
      <div class="ctg-header">
        <div class="ctg-logo-box">
          <img src="${logoSrc}" alt="${chamber.name}" style="max-width: 135px; max-height: 75px; object-fit: contain;">
        </div>
        <div class="ctg-center-titles">
          <div class="ctg-main-name">${(chamber.name || 'CÁMARA DE COMERCIO').toUpperCase()}</div>
          <div class="ctg-sub-name">CERTIFICADO DE EXISTENCIA Y REPRESENTACIÓN LEGAL</div>
          <div class="ctg-meta">Fecha expedición: ${fecha}</div>
          <div class="ctg-receipt">Recibo No. ${recibo}</div>
          <div class="ctg-code">CÓDIGO DE VERIFICACIÓN ${codigo}</div>
        </div>
      </div>
    `;

    return `
      <div class="cc-page style-custom-chamber">
        ${headerHtml}

        <div class="dashed-separator">-------------------------------------------------------------------------------------------------------------------</div>
        <div class="bga-disclaimer" style="font-size: 7.3pt; text-align: justify; line-height: 1.25;">
          ${disclaimer}
        </div>
        <div class="dashed-separator">-------------------------------------------------------------------------------------------------------------------</div>

        <div class="ctg-cert-intro" style="margin: 10px 0; font-size: 8.5pt; font-weight: bold;">
          ${lawIntro}
        </div>

        <div class="section-heading-centered">NOMBRE, IDENTIFICACIÓN Y DOMICILIO</div>
        <div class="standard-kv-list">
          <div class="kv-row"><span class="kv-k">Razón Social:</span><span class="kv-v">${(data.razonSocial || 'EMPRESA REGISTRADA S.A.S.').toUpperCase()}</span></div>
          <div class="kv-row"><span class="kv-k">Sigla:</span><span class="kv-v">${data.sigla || 'No reportó'}</span></div>
          <div class="kv-row"><span class="kv-k">Nit:</span><span class="kv-v">${data.nit || '900.123.456-7'}</span></div>
          <div class="kv-row"><span class="kv-k">Domicilio Principal:</span><span class="kv-v">${(data.ciudadCompleta || data.ciudad || chamber.city || 'COLOMBIA').toUpperCase()}</span></div>
        </div>

        <div class="section-heading-centered">MATRÍCULA / INSCRIPCIÓN</div>
        <div class="standard-kv-list">
          <div class="kv-row"><span class="kv-k">Matrícula No.:</span><span class="kv-v">${data.matricula || '812832-16'}</span></div>
          <div class="kv-row"><span class="kv-k">Fecha de matrícula:</span><span class="kv-v">${data.fechaMatricula || '17 de marzo de 2011'}</span></div>
          <div class="kv-row"><span class="kv-k">Último año renovado:</span><span class="kv-v">${data.ultimoAnoRenovado || '2026'}</span></div>
          <div class="kv-row"><span class="kv-k">Fecha de renovación:</span><span class="kv-v">${data.fechaRenovacion || '25 de marzo de 2026'}</span></div>
          <div class="kv-row"><span class="kv-k">Grupo NIIF:</span><span class="kv-v">${data.grupoNiif || 'Grupo 2'}</span></div>
        </div>

        <div class="section-heading-centered">UBICACIÓN Y CONTACTO</div>
        <div class="standard-kv-list">
          <div class="kv-row"><span class="kv-k">Dirección domicilio principal:</span><span class="kv-v">${data.direccion || 'CL 9 # 56-69 OF 201'}</span></div>
          <div class="kv-row"><span class="kv-k">Municipio:</span><span class="kv-v">${(data.ciudadCompleta || data.ciudad || chamber.city || 'COLOMBIA').toUpperCase()}</span></div>
          <div class="kv-row"><span class="kv-k">Correo electrónico:</span><span class="kv-v">${data.email || 'contacto@empresa.com.co'}</span></div>
          <div class="kv-row"><span class="kv-k">Teléfono comercial 1:</span><span class="kv-v">${data.telefono || '3006864940'}</span></div>
          <div class="kv-row"><span class="kv-k">Teléfono comercial 2:</span><span class="kv-v">${data.telefono2 || 'No reportó'}</span></div>
          <br>
          <div class="kv-row"><span class="kv-k">Dirección notificación judicial:</span><span class="kv-v">${data.direccionJudicial || data.direccion || 'CL 9 # 56-69 OF 201'}</span></div>
          <div class="kv-row"><span class="kv-k">Municipio:</span><span class="kv-v">${(data.municipioJudicial || data.ciudadCompleta || chamber.city || 'COLOMBIA').toUpperCase()}</span></div>
          <div class="kv-row"><span class="kv-k">Correo notificación judicial:</span><span class="kv-v">${data.emailNotificacion || data.email || 'notificaciones@empresa.com.co'}</span></div>
          <div class="kv-row"><span class="kv-k">Teléfono para notificación:</span><span class="kv-v">${data.telefonoJudicial || data.telefono || '3006864940'}</span></div>
        </div>

        <div class="bga-legal-notif" style="font-size: 8.5pt; text-align: justify; margin-top: 14px; line-height: 1.3;">
          La persona jurídica <strong>SI</strong> autorizó para recibir notificaciones personales a través de correo electrónico, de conformidad con lo establecido en los artículos 291 del Código General del Proceso y 67 del Código de Procedimiento Administrativo y de lo Contencioso Administrativo.
        </div>
      </div>
    `;
  },

  /**
   * Router maestro: selecciona la plantilla exacta según la ciudad
   */
  renderDocument(data) {
    const chamber = getChamberByCity(data.camaraSeleccionada || data.ciudadCompleta || data.ciudad);
    
    if (chamber.isCustom || chamber.styleId === 'custom') {
      return this.renderCustomChamber(data, chamber);
    }

    switch (chamber.styleId) {
      case 'bucaramanga':
        return this.renderBucaramanga(data);
      case 'barranquilla':
        return this.renderBarranquilla(data);
      case 'medellin':
        return this.renderMedellin(data);
      case 'cartagena':
        return this.renderCartagena(data);
      case 'manizales':
        return this.renderManizales ? this.renderManizales(data) : this.renderCustomChamber(data, chamber);
      case 'uraba':
        return this.renderUraba ? this.renderUraba(data) : this.renderCustomChamber(data, chamber);
      case 'cali':
      default:
        return this.renderCali(data);
    }
  }
};
