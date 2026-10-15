/**
 * Motor de Renderizado Multi-Estilo de Cámaras de Comercio de Colombia
 * Reproduce fielmente el estilo exacto de cada Cámara según la imagen correspondiente:
 * - Bucaramanga (Logo sup. derecho, disclaimer camaradirecta, estructura con decretos)
 * - Barranquilla (Logo sup. izquierdo, líneas guionadas, C E R T I F I C A)
 * - Medellín (Logo sup. derecho, disclaimer certificadoscamara, tabla monospaciada amplia)
 * - Cartagena (Logo sup. izquierdo, portal confecamaras empresa=09, paginación 1 de 5)
 * - Oriente Antioqueño (Logo sup. izquierdo verde, portal confecamaras empresa=51)
 * - Cali (Plantilla maestra CompraMas con recuadros oficiales)
 */

const TemplateEngine = {
  generateVerificationCode(chamberId = 'bucaramanga') {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let code = '';
    const prefix = chamberId === 'bucaramanga' ? 'E2UW20' :
                   chamberId === 'barranquilla' ? 'JD637AA' :
                   chamberId === 'cartagena' ? 'X9Pf2gn' :
                   chamberId === 'oriente_antioqueno' ? '2Gxq9MT' :
                   chamberId === 'medellin' ? 'UodLIyisnl' : '0822NX';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix + code;
  },

  generateReceiptNumber(chamberId = 'bucaramanga') {
    if (chamberId === 'oriente_antioqueno') return 'S000' + Math.floor(100000 + Math.random() * 900000);
    if (chamberId === 'cartagena') return 'S012' + Math.floor(100000 + Math.random() * 900000);
    if (chamberId === 'medellin') return '0030' + Math.floor(100000 + Math.random() * 900000);
    return Math.floor(10000000 + Math.random() * 90000000).toString();
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
      const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
      let h12 = date.getHours() % 12;
      h12 = h12 ? h12 : 12;
      return `${d}/${m}/${y} - ${pad(h12)}:${mm}:${ss} ${ampm}`;
    }
    return `${d}/${m}/${y} - ${hh}:${mm}:${ss}`;
  },

  /**
   * =========================================================================
   * 1. ESTILO CÁMARA DE COMERCIO DE BUCARAMANGA
   * =========================================================================
   */
  renderBucaramanga(data) {
    const chamber = CHAMBER_CATALOG.bucaramanga;
    const logoSrc = getChamberLogoSrc(chamber);
    const fecha = data.fechaExpedicion || this.formatDateByChamber('bucaramanga');
    const recibo = data.reciboNo || this.generateReceiptNumber('bucaramanga');
    const codigo = data.codigoVerificacion || this.generateVerificationCode('bucaramanga');

    return `
      <div class="cc-page style-bucaramanga">
        <div class="bga-header-grid">
          <div class="bga-header-left">
            <div class="bga-main-title">CÁMARA DE COMERCIO DE BUCARAMANGA</div>
            <div class="bga-sub">CERTIFICADO GENERADO A TRAVÉS DE PLATAFORMA VIRTUAL</div>
            <div class="bga-meta">LUGAR Y FECHA DE EXPEDICIÓN: BUCARAMANGA, ${fecha}</div>
            <div class="bga-receipt">${recibo}</div>
            <div class="bga-code">CÓDIGO DE VERIFICACIÓN: <strong>${codigo}</strong></div>
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
          CERTIFICADO DE EXISTENCIA Y REPRESENTACION LEGAL ENTIDAD DE:<br>
          <strong>${(data.razonSocial || 'COOPERATIVA DE CAFICULTORES DE SANTANDER LTDA.').toUpperCase()}</strong>
        </div>

        <div class="bga-row-simple">ESTADO MATRICULA: ACTIVO</div>

        <div class="bga-law-intro">
          EL SECRETARIO DE LA CAMARA DE COMERCIO DE BUCARAMANGA, EN EJERCICIO DE LAS FACULTADES CONFERIDAS POR LOS ARTICULOS 43 Y 144 DEL DECRETO 2150 DE 1.995, DECRETO 0427 DE 1.996 Y CON FUNDAMENTO EN LAS INSCRIPCIONES REALIZADAS POR LA ENTIDAD.
        </div>

        <div class="centered-spaced-title">C E R T I F I C A</div>

        <div class="bga-meta-group">
          <div>FECHA DE RENOVACIÓN: ${data.fechaRenovacion || 'MARZO 15 DE 2026'}</div>
          <div>GRUPO NIIF: ${data.grupoNiif || 'GRUPO II.'}</div>
        </div>

        <div class="centered-spaced-title">C E R T I F I C A</div>

        <div class="bga-record-block">
          <div>REGISTRO: ${data.matricula || '05-500460-21 DEL 1997/02/17'}</div>
          <div>NOMBRE:${(data.razonSocial || 'COOPERATIVA DE CAFICULTORES DE SANTANDER LTDA.').toUpperCase()}</div>
          <div>NIT:   ${data.nit || '890201988-3'}</div>
          <br>
          <div>DOMICILIO:  ${(data.ciudad || 'SAN GIL').toUpperCase()}</div>
          <br>
          <div class="bga-table-lines">
            <div class="bga-line-item"><span class="bga-lbl">DIRECCION :</span> <span class="bga-val">${data.direccion || 'CR. 12 NO. 9-44'}</span></div>
            <div class="bga-line-item"><span class="bga-lbl">MUNICIPIO :</span> <span class="bga-val">${(data.ciudadCompleta || 'SAN GIL - SANTANDER').toUpperCase()}</span></div>
            <div class="bga-line-item"><span class="bga-lbl">TELEFONO1 :</span> <span class="bga-val">${data.telefono || '7242556'}</span></div>
            <div class="bga-line-item"><span class="bga-lbl">TELEFONO2 :</span> <span class="bga-val">${data.telefono2 || '3143824057'}</span></div>
            <div class="bga-line-item"><span class="bga-lbl">EMAIL     :</span> <span class="bga-val">${data.email || 'secretaria@coopsantander.com'}</span></div>
          </div>
          <br>
          <div class="bga-bold-sub">NOTIFICACION JUDICIAL</div>
          <div class="bga-table-lines">
            <div class="bga-line-item"><span class="bga-lbl">DIRECCION :</span> <span class="bga-val">${data.direccionJudicial || data.direccion || 'CR. 12 NO. 9-44'}</span></div>
            <div class="bga-line-item"><span class="bga-lbl">MUNICIPIO :</span> <span class="bga-val">${(data.municipioJudicial || 'SAN GIL - SANTANDER').toUpperCase()}</span></div>
            <div class="bga-line-item"><span class="bga-lbl">TELEFONO1 :</span> <span class="bga-val">${data.telefonoJudicial || data.telefono || '7242556'}</span></div>
            <div class="bga-line-item"><span class="bga-lbl">TELEFONO2 :</span> <span class="bga-val">${data.telefonoJudicial2 || '3143824057'}</span></div>
            <div class="bga-line-item"><span class="bga-lbl">EMAIL     :</span> <span class="bga-val">${data.emailNotificacion || data.email || 'secretaria@coopsantander.com'}</span></div>
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
   * 2. ESTILO CÁMARA DE COMERCIO DE BARRANQUILLA
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
            <div class="baq-cert-type">CERTIFICADO DE EXISTENCIA Y REPRESENTACION LEGAL DE ENTIDADES.</div>
            <div class="baq-date">Fecha de expedición: ${fecha}</div>
            <div class="baq-receipt">Recibo No. ${recibo}, Valor: 11,600</div>
          </div>
        </div>

        <div class="baq-code-strip">-----------------CODIGO DE VERIFICACIÓN: ${codigo}-----------------</div>
        
        <div class="baq-disclaimer">
          Verifique el contenido y confiabilidad de este certificado, ingresando a www.camarabaq.org.co/ y digite el código, para que visualice la imagen generada al momento de su expedición. La verificación se puede realizar de manera ilimitada, durante 60 días calendario contados a partir de la fecha de su expedición.
        </div>
        <div class="dashed-separator">-------------------------------------------------------------------------------------------------------------------</div>

        <div class="centered-spaced-title" style="margin: 15px 0;">C E R T I F I C A</div>

        <div class="section-heading-centered">NOMBRE, IDENTIFICACIÓN Y DOMICILIO</div>
        <div class="standard-kv-list">
          <div class="kv-row"><span class="kv-k">Razón Social:</span><span class="kv-v">${data.razonSocial || 'FUNDACION ISRAAID COLOMBIA'}</span></div>
          <div class="kv-row"><span class="kv-k">Sigla:</span><span class="kv-v">${data.sigla || 'No reportó'}</span></div>
          <div class="kv-row"><span class="kv-k">Nit:</span><span class="kv-v">${data.nit || '901.409.873 - 9'}</span></div>
          <div class="kv-row"><span class="kv-k">Domicilio Principal:</span><span class="kv-v">${data.ciudad || 'Barranquilla'}</span></div>
        </div>

        <div class="section-heading-centered">INSCRIPCIÓN</div>
        <div class="standard-kv-list">
          <div class="kv-row"><span class="kv-k">Registro No.:</span><span class="kv-v">${data.matricula || '18.048'}</span></div>
          <div class="kv-row"><span class="kv-k">Fecha de registro:</span><span class="kv-v">${data.fechaMatricula || '10 de Sep/bre de 2020'}</span></div>
          <div class="kv-row"><span class="kv-k">Último año renovado:</span><span class="kv-v">${data.ultimoAnoRenovado || '2026'}</span></div>
          <div class="kv-row"><span class="kv-k">Fecha de renovación del registro:</span><span class="kv-v">${data.fechaRenovacion || '28 de Marzo de 2026'}</span></div>
          <div class="kv-row"><span class="kv-k">Grupo NIIF:</span><span class="kv-v">${data.grupoNiif || '4. GRUPO III. Microempresas'}</span></div>
        </div>

        <div class="section-heading-centered">UBICACIÓN</div>
        <div class="standard-kv-list">
          <div class="kv-row"><span class="kv-k">Direccion domicilio principal:</span><span class="kv-v">${data.direccion || 'CL 77 B No 57 - 103 OF 2303'}</span></div>
          <div class="kv-row"><span class="kv-k">Municipio:</span><span class="kv-v">${data.ciudadCompleta || 'Barranquilla - Atlantico'}</span></div>
          <div class="kv-row"><span class="kv-k">Correo electrónico:</span><span class="kv-v">${data.email || 'kgarcia@israaid.org'}</span></div>
          <div class="kv-row"><span class="kv-k">Teléfono comercial 1:</span><span class="kv-v">${data.telefono || '3354438'}</span></div>
          <div class="kv-row"><span class="kv-k">Teléfono comercial 2:</span><span class="kv-v">${data.telefono2 || 'No reportó'}</span></div>
          <div class="kv-row"><span class="kv-k">Teléfono comercial 3:</span><span class="kv-v">${data.telefono3 || 'No reportó'}</span></div>
          <br>
          <div class="kv-row"><span class="kv-k">Direccion para notificación judicial:</span><span class="kv-v">${data.direccionJudicial || data.direccion || 'CL 77 B No 57 - 103 OF 2303'}</span></div>
          <div class="kv-row"><span class="kv-k">Municipio:</span><span class="kv-v">${data.municipioJudicial || 'Barranquilla - Atlantico'}</span></div>
          <div class="kv-row"><span class="kv-k">Correo electrónico de notificación:</span><span class="kv-v">${data.emailNotificacion || data.email || 'kgarcia@israaid.org'}</span></div>
          <div class="kv-row"><span class="kv-k">Teléfono para notificación 1:</span><span class="kv-v">${data.telefonoJudicial || data.telefono || '3354438'}</span></div>
          <div class="kv-row"><span class="kv-k">Teléfono para notificación 2:</span><span class="kv-v">${data.telefonoJudicial2 || 'No reportó'}</span></div>
        </div>
      </div>
    `;
  },

  /**
   * =========================================================================
   * 3. ESTILO CÁMARA DE COMERCIO DE MEDELLÍN PARA ANTIOQUIA
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

        <div class="dashed-separator">-------------------------------------------------------------------------------------------------------------------</div>
        <div class="med-disclaimer">
          Verifique el contenido y confiabilidad de este certificado, ingresando a www.certificadoscamara.com y digite el respectivo código, para que visualice la imagen generada al momento de su expedición. La verificación se puede realizar de manera ilimitada, durante 60 días calendario, contados a partir de la fecha de su expedición.
        </div>
        <div class="dashed-separator">-------------------------------------------------------------------------------------------------------------------</div>

        <div class="med-intro-cert">
          CON FUNDAMENTO EN LAS INSCRIPCIONES EFECTUADAS EN EL REGISTRO MERCANTIL, LA CÁMARA DE COMERCIO CERTIFICA:
        </div>

        <div class="section-heading-centered" style="margin-top: 15px;">NOMBRE, IDENTIFICACIÓN Y DOMICILIO</div>
        <div class="med-table-rows">
          <div class="med-row"><span class="med-lbl">Razón social:</span> <span class="med-val">${(data.razonSocial || 'CORPORACION MAKAIA ASESORIA INTERNACIONAL').toUpperCase()}</span></div>
          <div class="med-row"><span class="med-lbl">Sigla:</span> <span class="med-val">${data.sigla || 'No reportó'}</span></div>
          <div class="med-row"><span class="med-lbl">Nit:</span> <span class="med-val">${data.nit || '900106664-1'}</span></div>
          <div class="med-row"><span class="med-lbl">Domicilio principal:</span> <span class="med-val">${(data.ciudadCompleta || 'MEDELLÍN, ANTIOQUIA, COLOMBIA').toUpperCase()}</span></div>
        </div>

        <div class="section-heading-centered">INSCRIPCION</div>
        <div class="med-table-rows">
          <div class="med-row"><span class="med-lbl">Inscripción No.:</span> <span class="med-val">${data.matricula || '21-009711-21'}</span></div>
          <div class="med-row"><span class="med-lbl">Fecha inscripción:</span> <span class="med-val">${data.fechaMatricula || '08 de Septiembre de 2006'}</span></div>
          <div class="med-row"><span class="med-lbl">Último año renovado:</span> <span class="med-val">${data.ultimoAnoRenovado || '2026'}</span></div>
          <div class="med-row"><span class="med-lbl">Fecha de renovación:</span> <span class="med-val">${data.fechaRenovacion || '19 de Marzo de 2026'}</span></div>
          <div class="med-row"><span class="med-lbl">Grupo NIIF:</span> <span class="med-val">${data.grupoNiif || 'GRUPO III.'}</span></div>
        </div>

        <div class="section-heading-centered">UBICACIÓN</div>
        <div class="med-table-rows">
          <div class="med-row"><span class="med-lbl">Dirección del domicilio principal:</span> <span class="med-val">${data.direccion || 'Carrera 43 A 34  155 OF 701'}</span></div>
          <div class="med-row"><span class="med-lbl">Municipio:</span> <span class="med-val">${(data.ciudadCompleta || 'MEDELLÍN, ANTIOQUIA, COLOMBIA').toUpperCase()}</span></div>
          <div class="med-row"><span class="med-lbl">Correo electrónico:</span> <span class="med-val">${data.email || 'direccion.operaciones@makaia.org'}</span></div>
          <div class="med-row"><span class="med-lbl">Teléfono comercial 1:</span> <span class="med-val">${data.telefono || '4480374'}</span></div>
          <div class="med-row"><span class="med-lbl">Teléfono comercial 2:</span> <span class="med-val">${data.telefono2 || '3188022847'}</span></div>
          <div class="med-row"><span class="med-lbl">Teléfono comercial 3:</span> <span class="med-val">${data.telefono3 || '3117209148'}</span></div>
          <div class="med-row"><span class="med-lbl">Página web:</span> <span class="med-val">No reportó</span></div>
          <br>
          <div class="med-row"><span class="med-lbl">Dirección para notificación judicial:</span> <span class="med-val">${data.direccionJudicial || data.direccion || 'Carrera 43 A 34  155 OF 701'}</span></div>
          <div class="med-row"><span class="med-lbl">Municipio:</span> <span class="med-val">${(data.municipioJudicial || 'MEDELLÍN, ANTIOQUIA, COLOMBIA').toUpperCase()}</span></div>
          <div class="med-row"><span class="med-lbl">Correo electrónico de notificación:</span> <span class="med-val">${data.emailNotificacion || data.email || 'carlos.gonzalez@makaia.org'}</span></div>
          <div class="med-row"><span class="med-lbl">Teléfono para notificación 1:</span> <span class="med-val">${data.telefonoJudicial || data.telefono || '4480374'}</span></div>
          <div class="med-row"><span class="med-lbl">Teléfono para notificación 2:</span> <span class="med-val">${data.telefonoJudicial2 || '3188022847'}</span></div>
        </div>

        <div class="med-legal-bottom">
          La persona jurídica ${(data.razonSocial || 'CORPORACION MAKAIA ASESORIA INTERNACIONAL').toUpperCase()} SI autorizó para recibir notificaciones personales a través de correo electrónico, de conformidad con lo establecido en los artículos 291 del Código General del Proceso y 67 del Código de Procedimiento...
        </div>
      </div>
    `;
  },

  /**
   * =========================================================================
   * 4. ESTILO CÁMARA DE COMERCIO DE CARTAGENA
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
          <div class="ctg-row"><span class="ctg-lbl">Último año renovado:</span> <span class="ctg-val">${data.ultimoAnoRenovado || '2026'}</span></div>
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
          <div class="ctg-row"><span class="ctg-lbl">Dirección para notificación judicial :</span> <span class="ctg-val">${data.direccionJudicial || data.direccion || 'BARRIO BOSQUE, TRANSVERSAL 54 Nro. 30 - 403'}</span></div>
          <div class="ctg-row"><span class="ctg-lbl">Municipio :</span> <span class="ctg-val">${data.municipioJudicial || 'Cartagena, Bolivar'}</span></div>
          <div class="ctg-row"><span class="ctg-lbl">Correo electrónico de notificación :</span> <span class="ctg-val">${data.emailNotificacion || data.email || 'spercol.sas@hotmail.com'}</span></div>
        </div>

        <div class="ctg-legal-notif">
          La persona jurídica <strong>SI</strong> autorizó para recibir notificaciones personales a través del correo electrónico, de conformidad con lo establecido en los artículos 291 del Código General del Proceso y del 67 del Código de Procedimiento Administrativo y de lo Contencioso Administrativo.
        </div>

        <div class="section-heading-centered" style="margin-top: 15px;">CONSTITUCIÓN</div>
        <div class="ctg-legal-notif">
          por documento privado del 18 de Noviembre de 2016 otorgado en Cartagena, inscrito en esta Cámara de Comercio el 21 de Noviembre de 2016 bajo el número 127545 del Libro IX del Registro Mercantil, se constituyó una sociedad por acciones simplificadas...
        </div>

        <div class="ctg-footer-pagination">
          Página 1 de 5
        </div>
      </div>
    `;
  },

  /**
   * =========================================================================
   * 5. ESTILO CÁMARA DE COMERCIO DEL ORIENTE ANTIOQUEÑO
   * =========================================================================
   */
  renderOrienteAntioqueno(data) {
    const chamber = CHAMBER_CATALOG.oriente_antioqueno;
    const logoSrc = getChamberLogoSrc(chamber);
    const fecha = data.fechaExpedicion || this.formatDateByChamber('oriente_antioqueno');
    const recibo = data.reciboNo || 'S000839860';
    const codigo = data.codigoVerificacion || this.generateVerificationCode('oriente_antioqueno');

    return `
      <div class="cc-page style-oriente">
        <div class="oriente-header">
          <div class="oriente-logo-box">
            <img src="${logoSrc}" alt="Cámara de Comercio Oriente Antioqueño" class="oriente-logo-img">
          </div>
          <div class="oriente-center-titles">
            <div class="oriente-main-name">CÁMARA DE COMERCIO DEL ORIENTE ANTIOQUEÑO</div>
            <div class="oriente-sub-name">CERTIFICADO DE EXISTENCIA Y REPRESENTACIÓN LEGAL</div>
            <div class="oriente-meta">Fecha expedición: ${fecha}</div>
            <div class="oriente-receipt">Recibo No. ${recibo}, Valor 7900</div>
            <div class="oriente-code">CÓDIGO DE VERIFICACIÓN ${codigo}</div>
          </div>
        </div>

        <div class="oriente-disclaimer">
          Verifique el contenido y confiabilidad de este certificado, ingresando a https://sii.confecamaras.co/vista/plantilla/cv.php?empresa=51 y digite el respectivo código, para que visualice la imagen generada al momento de su expedición. La verificación se puede realizar de manera ilimitada, durante 60 días calendario contados a partir de la fecha de su expedición.
        </div>

        <div class="oriente-intro-cert">
          CON FUNDAMENTO EN LAS INSCRIPCIONES DEL REGISTRO MERCANTIL, LA CÁMARA DE COMERCIO CERTIFICA:
        </div>

        <div class="section-heading-centered">NOMBRE, IDENTIFICACIÓN Y DOMICILIO</div>
        <div class="oriente-rows">
          <div class="oriente-row"><span class="oriente-lbl">Razón Social :</span> <span class="oriente-val">${(data.razonSocial || 'CORPORACION EDUCATIVA SANTA MARIA GORETTI').toUpperCase()}</span></div>
          <div class="oriente-row"><span class="oriente-lbl">Nit :</span> <span class="oriente-val">${data.nit || '800211876-2'}</span></div>
          <div class="oriente-row"><span class="oriente-lbl">Domicilio:</span> <span class="oriente-val">${data.ciudadCompleta || 'Rionegro, Antioquia'}</span></div>
        </div>

        <div class="section-heading-centered">INSCRIPCIÓN</div>
        <div class="oriente-rows">
          <div class="oriente-row"><span class="oriente-lbl">Inscripción No:</span> <span class="oriente-val">${data.matricula || 'S0500479'}</span></div>
          <div class="oriente-row"><span class="oriente-lbl">Fecha de inscripción:</span> <span class="oriente-val">${data.fechaMatricula || '26 de marzo de 1998'}</span></div>
          <div class="oriente-row"><span class="oriente-lbl">Ultimo año renovado:</span> <span class="oriente-val">${data.ultimoAnoRenovado || '2026'}</span></div>
          <div class="oriente-row"><span class="oriente-lbl">Fecha de renovación:</span> <span class="oriente-val">${data.fechaRenovacion || '01 de marzo de 2026'}</span></div>
          <div class="oriente-row"><span class="oriente-lbl">Grupo NIIF :</span> <span class="oriente-val">${data.grupoNiif || 'GRUPO III - MICROEMPRESAS'}</span></div>
        </div>

        <div class="section-heading-centered">UBICACIÓN</div>
        <div class="oriente-rows">
          <div class="oriente-row"><span class="oriente-lbl">Dirección del domicilio principal :</span> <span class="oriente-val">${data.direccion || 'VEREDA SANTA BARBARA FCA SANTA RITA N 2'}</span></div>
          <div class="oriente-row"><span class="oriente-lbl">Municipio :</span> <span class="oriente-val">${data.ciudadCompleta || 'Rionegro, Antioquia'}</span></div>
          <div class="oriente-row"><span class="oriente-lbl">Correo electrónico :</span> <span class="oriente-val">${data.email || 'hogargoretti@hotmail.com'}</span></div>
          <div class="oriente-row"><span class="oriente-lbl">Teléfono comercial 1 :</span> <span class="oriente-val">${data.telefono || '3117698950'}</span></div>
          <div class="oriente-row"><span class="oriente-lbl">Teléfono comercial 2 :</span> <span class="oriente-val">${data.telefono2 || '3122599623'}</span></div>
        </div>

        <div class="oriente-legal-notif">
          La persona jurídica <strong>SI</strong> autorizó para recibir notificaciones personales a través del correo electrónico, de conformidad con lo establecido en los artículos 291 del Código General del Proceso y del 67 del Código de Procedimiento Administrativo y de lo Contencioso Administrativo.
        </div>
      </div>
    `;
  },

  /**
   * =========================================================================
   * 6. ESTILO CÁMARA DE COMERCIO DE CALI (COMPRAMAS)
   * =========================================================================
   */
  renderCali(data) {
    const bgUrl = typeof TEMPLATE_CALI_BG_BASE64 !== 'undefined' 
      ? TEMPLATE_CALI_BG_BASE64 
      : 'assets/images/template-cali-master.png';

    const cleanRazon = data.razonSocial || 'CompraMas';
    const notifText = data.textoNotificacion || `La persona jurídica Aura y Home SI autorizó recibir notificaciones personales a  través de correo electrónico, de conformidad con lo establecido en los artículos 291  del Código General del Proceso y 67 del Código de Procedimiento Administrativo y de  lo Contencioso administrativo.`;

    return `
      <div class="cc-page cc-page-master-official" data-page="1" style="background-image: url('${bgUrl}');">
        <div class="cali-overlay cali-code">${data.codigoVerificacion || '0822NXIH99'}</div>
        <div class="cali-overlay cali-date">${data.fechaExpedicion || '12/04/2022 10:03:42 am'}</div>
        <div class="cali-overlay cali-empresa">
          <div class="cali-line">${cleanRazon}</div>
          <div class="cali-line">${data.nit || '900421494-6'}</div>
          <div class="cali-line">${data.establecimiento || cleanRazon}</div>
          <div class="cali-line">${data.domicilioPrincipal || data.ciudad || 'Jamundi'}</div>
        </div>
        <div class="cali-overlay cali-matricula">
          <div class="cali-line">${data.matricula || '812832-16'}</div>
          <div class="cali-line">${data.fechaMatricula || '17 de marzo de 2011'}</div>
          <div class="cali-line">${data.ultimoAnoRenovado || '2022'}</div>
          <div class="cali-line">${data.fechaRenovacion || '25 de marzo de 2022'}</div>
          <div class="cali-line">${data.grupoNiif || 'Grupo 2'}</div>
        </div>
        <div class="cali-overlay cali-ubicacion">
          <div class="cali-subblock-values">
            <div class="cali-line">${data.direccion || 'CL 9 # 56-69 of 201'}</div>
            <div class="cali-line">${data.ciudadCompleta || data.ciudad || 'Cali - Valle'}&nbsp;&nbsp;&nbsp;&nbsp;${data.email || 'administracion@compramas.space'}</div>
            <div class="cali-line">${data.telefono || '3006864940'}</div>
            <div class="cali-line">${data.telefono2 || 'No reportó'}</div>
            <div class="cali-line">${data.telefono3 || 'No reportó'}</div>
          </div>
          <div class="cali-subblock-values" style="margin-top: 13px;">
            <div class="cali-line">${data.direccionJudicial || data.direccion || 'CL 9 # 56-69 of 201'}</div>
            <div class="cali-line">${data.municipioJudicial || 'Cali - Valle del Cauca'}</div>
            <div class="cali-line">${data.emailNotificacion || data.email || 'administracion@compramas.space'}</div>
            <div class="cali-line">${data.telefonoJudicial || data.telefono || '3006864940'}</div>
            <div class="cali-line">${data.telefonoJudicial2 || 'No reportó'}</div>
          </div>
          <div class="cali-legal-text">${notifText}</div>
        </div>
      </div>
    `;
  },

  /**
   * Router maestro: selecciona la plantilla exacta según la ciudad
   */
  renderDocument(data) {
    const chamber = getChamberByCity(data.camaraSeleccionada || data.ciudadCompleta || data.ciudad);
    
    switch (chamber.styleId) {
      case 'bucaramanga':
        return this.renderBucaramanga(data);
      case 'barranquilla':
        return this.renderBarranquilla(data);
      case 'medellin':
        return this.renderMedellin(data);
      case 'cartagena':
        return this.renderCartagena(data);
      case 'oriente_antioqueno':
        return this.renderOrienteAntioqueno(data);
      case 'cali':
      default:
        return this.renderCali(data);
    }
  }
};
