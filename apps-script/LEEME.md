# Conectar el formulario con Google Sheets

1. Abre la carpeta de Drive donde se guardan los documentos y, dentro de ella,
   crea un Google Sheet nuevo (**Nuevo → Hojas de cálculo de Google**),
   por ejemplo "Levantamiento PDP – Respuestas".
2. En el Sheet abre **Extensiones → Apps Script**.
3. Borra lo que aparece y pega todo el contenido de `Codigo.gs`. Guarda.
4. Haz clic en **Implementar → Nueva implementación**.
   - Tipo: **Aplicación web**.
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier usuario**.
5. Autoriza los permisos que pide Google. Si aparece "Google no verificó esta app",
   entra en **Configuración avanzada → Ir a … (no seguro)**. Es tu propio script.
6. Copia la **URL de la aplicación web**. Termina en `/exec`.
7. En `index.html` pega la URL en esta línea y sube el cambio:

   ```js
   const SHEET_URL='https://script.google.com/macros/s/XXXX/exec';
   ```

Si cambias `Codigo.gs` después, ve a **Implementar → Administrar implementaciones →
Editar → Versión: Nueva versión**. Así la URL sigue siendo la misma.

## Qué hojas se crean

| Hoja | Contenido |
|---|---|
| Respuestas | Una fila por envío con datos generales, aviso, seguridad, consentimiento e incidentes |
| Bases de datos | Una fila por cada base registrada |
| Accesos | Una fila por cada acceso |
| Terceros | Una fila por cada tercero |
| JSON | El envío completo como respaldo y el enlace a su archivo en Drive |

Cada envío también se guarda como archivo `.json` en la carpeta de Drive
definida en `CARPETA_ID`, al inicio de `Codigo.gs`. Para usar otra carpeta,
cambia ese valor por el ID que aparece en su enlace después de `/folders/`.

Todas tienen la columna **ID envío** para relacionar las filas de un mismo envío.
