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

app.use((req, res, next) => {
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            try {
                const requestHost = req.get('host');
                const originHost = new URL(origin).host;

                if (requestHost && originHost === requestHost) {
                    return callback(null, true);
                }
            } catch (error) {
                return callback(new Error('Origen no permitido por CORS'));
            }

            return callback(new Error('Origen no permitido por CORS'));
        }
    })(req, res, next);
});

app.use((error, req, res, next) => {
    if (error.message === 'Origen no permitido por CORS') {
        return res.status(403).json({
            error: error.message
        });
    }

    return next(error);
});

app.use('/api-docs', cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(null, true);
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
