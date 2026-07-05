const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const conectarMongo = require('./config/database');
const swaggerDocument = require('./swagger.json');

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Origen no permitido por CORS'));
    }
}));
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

async function iniciarServidor() {

    const db = await conectarMongo();

    app.use('/usuarios', require('./routes/usuarios')(db));
    app.use('/productos', require('./routes/productos')(db));
    app.use('/publicaciones', require('./routes/publicaciones')(db));
    app.use('/comentarios', require('./routes/comentarios')(db));
    app.use('/reacciones', require('./routes/reacciones')(db));
    app.use('/seguidores', require('./routes/seguidores')(db));
    app.use('/notificaciones', require('./routes/notificaciones')(db));

    app.get('/', (req, res) => {
        res.json({
            mensaje: 'Servidor NodeJS conectado con MongoDB',
            swagger: '/api-docs'
        });
    });

    app.listen(PORT, () => {
        console.log(`Servidor iniciado en puerto ${PORT}`);
    });

}

iniciarServidor();
