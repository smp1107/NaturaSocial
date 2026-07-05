const express = require('express');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const sanitizeUser = (user) => {
    if (!user) return null;

    const { passwordHash, password, ...safeUser } = user;
    return safeUser;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = (db) => {

    const router = express.Router();
    const collection = db.collection('Usuarios');

    router.post('/login', async (req, res) => {
        try {

            const { correo, password } = req.body;

            if (!correo || !password) {
                return res.status(400).json({
                    mensaje: 'Correo y contraseña son obligatorios'
                });
            }

            const usuario = await collection.findOne({
                correo: { $regex: `^${escapeRegex(correo)}$`, $options: 'i' }
            });

            if (!usuario || !usuario.passwordHash) {
                return res.status(401).json({
                    mensaje: 'Credenciales invalidas'
                });
            }

            const passwordCorrecta = await bcrypt.compare(password, usuario.passwordHash);

            if (!passwordCorrecta) {
                return res.status(401).json({
                    mensaje: 'Credenciales invalidas'
                });
            }

            res.status(200).json({
                mensaje: 'Inicio de sesion correcto',
                usuario: sanitizeUser(usuario)
            });

        } catch (error) {

            res.status(500).json({
                error: error.message
            });

        }
    });

    router.post('/', async (req, res) => {
        try {

            const { password, ...datosUsuario } = req.body;

            if (!datosUsuario.nombre || !datosUsuario.correo || !password) {
                return res.status(400).json({
                    mensaje: 'Nombre, correo y contraseña son obligatorios'
                });
            }

            const usuarioExistente = await collection.findOne({
                correo: { $regex: `^${escapeRegex(datosUsuario.correo)}$`, $options: 'i' }
            });

            if (usuarioExistente) {
                if (!usuarioExistente.passwordHash) {
                    const passwordHash = await bcrypt.hash(password, 10);

                    await collection.updateOne(
                        { _id: usuarioExistente._id },
                        {
                            $set: {
                                ...datosUsuario,
                                passwordHash
                            }
                        }
                    );

                    return res.status(200).json({
                        mensaje: 'Usuario actualizado con contraseña correctamente',
                        id: usuarioExistente._id
                    });
                }

                return res.status(409).json({
                    mensaje: 'El correo ya esta registrado'
                });
            }

            const passwordHash = await bcrypt.hash(password, 10);

            const resultado = await collection.insertOne({
                ...datosUsuario,
                passwordHash
            });

            res.status(201).json({
                mensaje: 'Usuario creado correctamente',
                id: resultado.insertedId
            });

        } catch (error) {

            res.status(500).json({
                error: error.message
            });

        }
    });

    router.get('/', async (req, res) => {

        try {

            const datos = await collection.find({}, {
                projection: {
                    passwordHash: 0,
                    password: 0
                }
            }).toArray();

            res.status(200).json(datos);

        } catch (error) {

            res.status(500).json({
                error: error.message
            });

        }

    });

    router.put('/:id', async (req, res) => {

        try {

            const { password, ...datosUsuario } = req.body;
            const cambios = { ...datosUsuario };

            if (password) {
                cambios.passwordHash = await bcrypt.hash(password, 10);
            }

            const resultado = await collection.updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: cambios }
            );

            if (resultado.matchedCount === 0) {
                return res.status(404).json({
                    mensaje: 'Usuario no encontrado'
                });
            }

            res.status(200).json({
                mensaje: 'Usuario actualizado correctamente'
            });

        } catch (error) {

            res.status(500).json({
                error: error.message
            });

        }

    });

    router.delete('/:id', async (req, res) => {

        try {

            const resultado = await collection.deleteOne({
                _id: new ObjectId(req.params.id)
            });

            if (resultado.deletedCount === 0) {
                return res.status(404).json({
                    mensaje: 'Usuario no encontrado'
                });
            }

            res.status(200).json({
                mensaje: 'Usuario eliminado correctamente'
            });

        } catch (error) {

            res.status(500).json({
                error: error.message
            });

        }

    });

    return router;

};
