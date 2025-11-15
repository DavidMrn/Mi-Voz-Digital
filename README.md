# Proyecto de Hackathon 
**Del 14 de noviembre de 2025 a 15 noviembre de 2025.**

  
## Descripción.


Este proyecto o aplicación web; ayudará a crear una comunidad más unida por el cuidado de nuestros espacios, proponer mediante el apartado de propuestas cosas que les gustaría ver en los espacios y más, todo con un sistema de votos y filtros como ver por estado, recientes y más; que ayudarán al líder de la comunidad a saber que es lo que más pide su comunidad.
Cuenta con un sistema de fotos y localización para saber en donde está el problema y más.
A su vez como el nombre de la persona que lo sugirió o comentó.


### Tipos de usuarios
###  **Ciudadano**

- Se registra con: nombre, usuario, contraseña
- Ve reportes y propuestas de todos
- **Crea reportes**: título, descripción, ubicación, imagen, comuna
- **Crea propuestas**: título, descripción, categoría, comuna
- **Vota** reportes/propuestas (cada uno puede votar una sola vez)

### 2. **Lider o Admin**

- Usuario: `admin`
- Contraseña: `Admin123`
- Ve **panel de gestión** con todos los reportes/propuestas
- **Filtra** por: comuna, categoría, tipo, estado
- **Cambia estado**: pendiente → en-proceso → resuelto
- Ve contadores (cuántos reportes, propuestas, votos, etc.)


## Tecnologías Usadas.

- **Frontend:** HTML, CSS, JavaScript 
- **Backend:** NodeJS + Express
- **Base de datos:** MongoDB Atlas en la nube
- **Seguridad:** Bcrypt (Cifra contraseñas)
- **Hosting:** Render (Para tener la app en internet)

## Estructura del Código.

Mi-Voz-Digital/

    public/                    # Frontend (lo que ve el usuario)
        index.html            # Una sola página con todas las pantallas
        script.js             # Lógica JavaScript (login, votar, crear, etc)
        styles.css            # Estilos CSS (colores, posiciones)

    models/                    # Definiciones de datos (MongoDB)
        User.js               # Estructura: nombre, usuario, contraseña
        Reporte.js            # Estructura: título, descripción, votos, estado
        Propuesta.js          # Similar a Reporte

server.js                 # Servidor Express (todas las rutas API)
db.js                     # Conexión a MongoDB Atlas
package.json              # Lista de librerías necesarias
.env                      # Variables secretas (MONGO_URI, PORT)
render.yaml               # Configuración para Render
README.md                 # Documentacion
