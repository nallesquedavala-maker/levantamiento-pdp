/**
 * Recibe los envíos del Levantamiento PDP y guarda cada apartado
 * del formulario en su propia carpeta de Google Drive.
 *
 * Dentro de cada carpeta se crea (la primera vez) una hoja de cálculo
 * "<Apartado> – Respuestas". Cada envío agrega filas a esa hoja.
 * Todas las hojas comparten la columna "ID envío" para relacionar
 * las respuestas de una misma persona.
 */

// Carpeta principal compartida en Drive.
var CARPETA_ID = '1Z0isaHtyFkbfMhgyDhITb-NJF8Umh3C_';

/* Un renglón por apartado del formulario.
 * carpeta → nombre con el que se crea la carpeta si no existe.
 * claves  → palabras para reconocer una carpeta que ya existe
 *           (no importan mayúsculas, acentos ni números al inicio).
 * id      → opcional. Si pegas aquí el ID de una carpeta, se usa esa
 *           y se ignoran el nombre y las claves.
 */
var APARTADOS = {
  av:   { carpeta: 'Aviso de privacidad',            claves: ['aviso'],                        id: '' },
  base: { carpeta: 'Bases de datos',                 claves: ['bases de datos', 'base de datos'], id: '' },
  acc:  { carpeta: 'Accesos',                        claves: ['acceso'],                       id: '' },
  seg:  { carpeta: 'Medidas de seguridad',           claves: ['seguridad'],                    id: '' },
  cons: { carpeta: 'Consentimiento y derechos ARCO', claves: ['consentimiento', 'arco'],       id: '' },
  ter:  { carpeta: 'Terceros',                       claves: ['tercero'],                      id: '' },
  inc:  { carpeta: 'Incidentes y conservación',      claves: ['incidente', 'conservacion'],    id: '' }
};

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var datos = JSON.parse(e.postData.contents);
    var guardados = [];

    Object.keys(APARTADOS).forEach(function (clave) {
      var tabla = datos.apartados[clave];
      if (!tabla || !tabla.rows.length) return;
      var libro = libroDelApartado(clave);
      agregarFilas(libro.getSheets()[0], tabla.headers, tabla.rows);
      guardados.push(clave);
    });

    return respuesta({ ok: true, id: datos.id, guardados: guardados });
  } catch (err) {
    return respuesta({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* Devuelve la hoja de cálculo del apartado, creándola si hace falta.
   Recuerda su ID para no buscarla en cada envío. */
function libroDelApartado(clave) {
  var props = PropertiesService.getScriptProperties();
  var guardado = props.getProperty('libro_' + clave);
  if (guardado) {
    try { return SpreadsheetApp.openById(guardado); } catch (err) { /* se borró: se vuelve a crear */ }
  }

  var carpeta = carpetaDelApartado(clave);
  var nombre = APARTADOS[clave].carpeta + ' – Respuestas';
  var existentes = carpeta.getFilesByName(nombre);
  var libro = existentes.hasNext()
    ? SpreadsheetApp.openById(existentes.next().getId())
    : crearLibro(nombre, carpeta);

  props.setProperty('libro_' + clave, libro.getId());
  return libro;
}

function crearLibro(nombre, carpeta) {
  var libro = SpreadsheetApp.create(nombre);
  DriveApp.getFileById(libro.getId()).moveTo(carpeta);
  return libro;
}

function carpetaDelApartado(clave) {
  var cfg = APARTADOS[clave];
  if (cfg.id) return DriveApp.getFolderById(cfg.id);

  var principal = DriveApp.getFolderById(CARPETA_ID);
  var hijas = principal.getFolders();
  while (hijas.hasNext()) {
    var c = hijas.next();
    var n = normaliza(c.getName());
    for (var i = 0; i < cfg.claves.length; i++) {
      if (n.indexOf(normaliza(cfg.claves[i])) >= 0) return c;
    }
  }
  return principal.createFolder(cfg.carpeta);
}

function normaliza(t) {
  return String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/* Agrega filas acomodando cada valor bajo su encabezado.
   Si el formulario trae una columna nueva, la añade al final. */
function agregarFilas(hoja, headers, rows) {
  var actuales = hoja.getLastColumn()
    ? hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0]
    : [];

  headers.forEach(function (h) {
    if (actuales.indexOf(h) < 0) actuales.push(h);
  });
  hoja.getRange(1, 1, 1, actuales.length).setValues([actuales])
    .setFontWeight('bold').setBackground('#e8eef7');
  hoja.setFrozenRows(1);

  var filas = rows.map(function (r) {
    return actuales.map(function (h) {
      var i = headers.indexOf(h);
      return i < 0 ? '' : r[i];
    });
  });
  hoja.getRange(hoja.getLastRow() + 1, 1, filas.length, actuales.length).setValues(filas);
}

function respuesta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Ejecútala una vez desde el editor para autorizar permisos y
   ver en el registro qué carpeta se usará para cada apartado. */
function probarCarpetas() {
  Object.keys(APARTADOS).forEach(function (clave) {
    var c = carpetaDelApartado(clave);
    Logger.log(APARTADOS[clave].carpeta + '  →  ' + c.getName() + '  (' + c.getUrl() + ')');
  });
}

/* Para comprobar en el navegador que la URL funciona. */
function doGet() {
  return respuesta({ ok: true, mensaje: 'El script del Levantamiento PDP está activo.' });
}
