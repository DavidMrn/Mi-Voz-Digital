// db.js
const mongoose = require('mongoose');

async function conectarDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "HackClus"
        });
        console.log("📦 Conectado a MongoDB Atlas");
    } catch (error) {
        console.error("❌ Error conectando a MongoDB:", error);
    }
}

module.exports = conectarDB;
