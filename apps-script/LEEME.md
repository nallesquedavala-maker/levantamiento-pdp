# Conectar el formulario con las carpetas de Drive

Cada apartado del formulario se guarda en su propia carpeta, dentro de la
carpeta principal definida en `CARPETA_ID`:

| Apartado del formulario | Carpeta | Qué se guarda |
|---|---|---|
| 2. Aviso de Privacidad | Aviso de privacidad | Una fila por envío |
| 3. Bases de datos | Bases de datos | Una fila por cada base |
| 4. Accesos | Accesos | Una fila por cada acceso |
| 5. Medidas de seguridad | Medidas de seguridad | Una fila por envío |
| 6. Consentimiento y ARCO | Consentimiento y derechos ARCO | Una fila por envío |
| 7. Terceros | Terceros | Una fila por cada tercero |
| 8. Incidentes y conservación | Incidentes y conservación | Una fila por envío |

En cada carpeta se crea una hoja de cálculo "<Apartado> – Respuestas" la primera
vez que llega un envío. Todas tienen la columna **ID envío** para relacionar las
respuestas de una misma persona.

Si la carpeta ya existe, el script la reconoce por palabras clave de su nombre,
aunque tenga número al inicio (por ejemplo "03 Bases de datos"). Si no la
encuentra, la crea. Para forzar una carpeta concreta, pega su ID en el campo
`id` de ese apartado dentro de `APARTADOS`.

## Pasos

1. Entra a script.google.com y haz clic en **Nuevo proyecto**.
2. Borra lo que aparece, pega todo `Codigo.gs` y guarda.
3. En el menú de funciones elige **probarCarpetas** y haz clic en **Ejecutar**.
   Autoriza los permisos. Si aparece "Google no verificó esta app", entra en
   **Configuración avanzada → Ir a … (no seguro)**. Es tu propio script.
4. Abre el **Registro de ejecución** y revisa que cada apartado apunte a la carpeta correcta.
5. Haz clic en **Implementar → Nueva implementación**.
   - Tipo: **Aplicación web**.
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier usuario**.
6. Copia la **URL de la aplicación web**, que termina en `/exec`.
7. En `index.html` pega la URL en esta línea y sube el cambio:

   ```js
   const SHEET_URL='https://script.google.com/macros/s/XXXX/exec';
   ```

Si cambias `Codigo.gs` después, ve a **Implementar → Administrar implementaciones →
Editar → Versión: Nueva versión**. Así la URL sigue siendo la misma.
