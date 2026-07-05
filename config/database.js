const { MongoClient } = require('mongodb');

const configuredUrl = process.env.MONGO_URL || process.env.MONGODB_URI;
const urls = configuredUrl
    ? [configuredUrl]
    : ['mongodb://127.0.0.1:27017', 'mongodb://host.docker.internal:27017'];
const databaseName = process.env.MONGODB_DB || 'NaturaSocialDB';

async function conectarMongo() {
    for (const url of urls) {
        const client = new MongoClient(url);

        try {
        await client.connect();
        console.log(`Conectado a MongoDB en ${url}`);
        return client.db(databaseName);
        } catch (error) {
            console.error(`No se pudo conectar a MongoDB en ${url}:`, error.message);
        }
    }

    console.error('Error al conectar MongoDB: no hay servidores disponibles');
    process.exit(1);
}

module.exports = conectarMongo;
