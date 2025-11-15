# Proyecto de Hackathon 
**Del 14 de noviembre de 2025 a 15 noviembre de 2025.**

Documentación por: [David Morón](https://github.com/Jawuj)
[[15-11-2025]] 01:00 - 02:35

# Imagenes

<table border="0">
  <tr>
    <td><img src="https://raw.githubusercontent.com/DavidMrn/Mi-Voz-Digital/refs/heads/main/images/paginaprincipal.png" width="300"/></td>
    <td><img src="https://raw.githubusercontent.com/DavidMrn/Mi-Voz-Digital/refs/heads/main/images/iniciosesionciudadano.png" width="300"/></td>
    <td><img src="https://raw.githubusercontent.com/DavidMrn/Mi-Voz-Digital/refs/heads/main/images/panelciudadano.png" width="300"/></td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/DavidMrn/Mi-Voz-Digital/refs/heads/main/images/reportarproblema.png" width="300"/></td>
    <td><img src="https://raw.githubusercontent.com/DavidMrn/Mi-Voz-Digital/refs/heads/main/images/proponeridea.png" width="300"/></td>
    <td><img src="https://raw.githubusercontent.com/DavidMrn/Mi-Voz-Digital/refs/heads/main/images/panellideradmin.png" width="300"/></td>
  </tr>
</table>

  
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



## Para entender mejor su sistema de forma rápida. 
Un poco curioso, ¿no?

# NodeJS.

Se define como un programa que te permite correr JavaScript en el servidor.
En el caso del **server.js** del proyecto, creamos el servidor y donde está el puerto.

```java 
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
```

Y se configuran los **Middlewares:** Un middleware de forma rapida es una especie de filtro que se ejecuta durante la petición HTTP antes de llegar a la ruta final, este sirve para verificar si los datos que se envían son de un usuario registrado, parsear datos, en este caso JSON.

```java

app.use(cors({ ... }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

```

Y de resto el **server.js** se conforma de **endpoints** con try_catch para detectar error y el porqué no se ejecutó cierto endpoint.

- app.post es para crear datos (POST).
- app.get es para leer datos (GET).
- app.put es para actualizar datos (PUT).


# Frontend.

El front-end está hecho de forma básica: HTML, CSS y JavaScript base. Lleno de condicionales para ver que elige el usuario y así mostrarle cierta interfaz.
CSS para los diseños y el HTML para una base sólida.


# Hosting.

Para el hosting se usó la version free de Render, el cual permite de manera muy cómoda integrar MongoDB con ella (Y como es un hosting, esto significa que no tenemos por qué correr el código de la terminal, o en tu caso hacer git clone y probar la app; de nada.
Aun así aquí está el repositorio, si es que esto lo lees de otro lado: [!Click¡](https://github.com/DavidMrn/Mi-Voz-Digital) )

- Es importante que a la hora de usar Render y tenemos servidor, back-end, rutas dinámicas y más usemos **Web Service**. El **Static Site** son para páginas que no necesitan eso. 
- Tener tu proyecto en un repositorio para que Render pueda compilarlo y construirlo en su servidor; así también puedes hacer push y commits desde Visual Studio para tests más rápidos. 


# Base de Datos.

**¿Cómo se conecta a MongoDB?**

> Es importante habilitar en IP Acces List > **0.0.0.0/0** | Esto permite que cualquier IP se puede conectar y usar la app sin tener que meter en una White List todas las IPs  

MongoDB, como ya mencionamos antes, está en la nube, o sea no es local en el equipo y funciona desde cualquier lado (siempre y cuando tengas internet, claro). 
A su vez, es una base de datos NoSQL, o sea que guarda datos en forma de documentos JSON.

Lo más importante de MongoDB es el **.env** y este es básicamente el que da acceso a todo, guarda el usuario, contraseña y puerto al que debe conectarse; esta contraseña solo la deben ver MongoDB y Render (Mediante su panel y las Environment Variables, donde se coloca **MONGO_URI** y **PORT**)

De caso contrario cualquier persona con conocimientos mínimos puede simplemente borrar la base de datos y dañar el flujo de trabajo de la aplicación web.

El código principal para conectarla es: 


```java title:connection.js

const mongoose = require('mongoose');

async function conectarDB() {
    try {
        // Lee MONGO_URI de .env (o de variables de Render)
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "HackClus"  // Especifica la BD
        });
        console.log("📦 Conectado a MongoDB Atlas");
    } catch (error) {
        console.error("❌ Error conectando a MongoDB:", error);
    }
}

module.exports = conectarDB;

```

Básicamente, lee el procces.env.MONGO_URl la cual es la contraseña guardada. 
Acto seguido intenta conectar a MongoDB Atlas y se especifica la Base de Datos que se va a usar.
Si conecta exitosamente imprime Conectado, de lo contrario error.

## Server.js

```java title:server.js

require('dotenv').config();  // Lee .env

const conectarDB = require('./db');  // Importa la conexión

// ... resto del código ...

// AL FINAL, CONECTA Y ARRANCA:
conectarDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en: http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('No se pudo conectar a la DB, servidor no arrancado:', err);
});

```

require('dotenv').config();  Lee el archivo **.env** y como ahí está el puerto donde se conectará lo agarra de ahí.
Importa la función conectarDB de db.js que podemos ver al final de esta.
Intenta conectar y condicional para arranque exitoso o error.

## Estructura 

Cuando esta conecta con éxito, se usa **Mongoose** para definir cómo se verán los datos y Crea la tabla llamada reportes. De una manera bastante parecida a los documentos JSON como ya mencioné antes.


```java

// models/Reporte.js
const mongoose = require('mongoose');

const ReporteSchema = new mongoose.Schema({
  id: { type: String, index: true },
  titulo: String,
  descripcion: String,
  votos: { type: Number, default: 0 },
  estado: { type: String, default: 'pendiente' },
  fecha: { type: Date, default: Date.now },
  imagen: String,
  // ... más campos
});

module.exports = mongoose.model('Reporte', ReporteSchema);

```




---




Eso es todo por hoy. 
Para aquel que lea esto y/o evalúe (Si es que se lee):

No tenía muchas ganas de realizar este proyecto o reto; pero el ver como se conectaba MongoDB y Render; como podía enviar información desde el celular y se actualizaba en mi Laptop, simplemente me enamoró. Aunque la IA estuvo todo el tiempo conmigo en cada error, es algo que definitivamente tengo que aprender en profundidad.

Gracias.


— David.
