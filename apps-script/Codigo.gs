/**
 * Recibe los envíos del Levantamiento PDP y los guarda en este Google Sheet.
 *
 * Crea (si no existen) estas hojas:
 *   Respuestas      → una fila por envío con los datos generales
 *   Bases de datos  → una fila por cada base registrada
 *   Accesos         → una fila por cada acceso registrado
 *   Terceros        → una fila por cada tercero registrado
 *   JSON            → el envío completo, como respaldo
 *
 * Todas las hojas comparten la columna "ID envío" para relacionarlas.
 *
 * Además guarda cada envío como archivo .json en la carpeta de Drive indicada.
 */

// Carpeta de Drive donde se guardan los archivos de cada envío.
var CARPETA_ID = '1Z0isaHtyFkbfMhgyDhITb-NJF8Umh3C_';

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var datos = JSON.parse(e.postData.contents);
    var libro = SpreadsheetApp.getActiveSpreadsheet();

    Object.keys(datos.hojas).forEach(function (nombre) {
      var tabla = datos.hojas[nombre];
      if (tabla.rows.length) agregarFilas(libro, nombre, tabla.headers, tabla.rows);
    });

    var archivo = guardarEnDrive(datos);

    agregarFilas(libro, 'JSON', ['ID envío', 'Fecha', 'Archivo en Drive', 'Contenido'],
      [[datos.id, datos.fecha, archivo, String(datos.json).slice(0, 49000)]]);

    return respuesta({ ok: true, id: datos.id });
  } catch (err) {
    return respuesta({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* Agrega filas acomodando cada valor bajo su encabezado.
   Si el formulario trae una columna nueva, la añade al final. */
function agregarFilas(libro, nombre, headers, rows) {
  var hoja = libro.getSheetByName(nombre) || libro.insertSheet(nombre);
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

/* Crea un archivo .json con el envío completo dentro de la carpeta de Drive.
   Si algo falla, el envío se guarda igual en el Sheet. */
function guardarEnDrive(datos) {
  try {
    var carpeta = DriveApp.getFolderById(CARPETA_ID);
    var hoy = Utilities.formatDate(new Date(), 'America/Mexico_City', 'yyyy-MM-dd');
    var nombre = 'Levantamiento_DX_' + hoy + '_' + datos.id + '.json';
    var contenido = JSON.stringify(JSON.parse(datos.json), null, 2);
    return carpeta.createFile(nombre, contenido, 'application/json').getUrl();
  } catch (err) {
    return 'No se pudo guardar en Drive: ' + err;
  }
}

function respuesta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Para comprobar en el navegador que la URL funciona. */
function doGet() {
  return respuesta({ ok: true, mensaje: 'El script del Levantamiento PDP está activo.' });
}
