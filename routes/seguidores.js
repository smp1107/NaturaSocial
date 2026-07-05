const express = require('express');
const { ObjectId } = require('mongodb');

module.exports = (db) => {

    const router = express.Router();
    const collection = db.collection('Seguidores');

    router.post('/', async (req, res) => {
        try {

            const resultado = await collection.insertOne(req.body);

            res.status(201).json({
                mensaje: 'Seguidor creado correctamente',
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

            const datos = await collection.find().toArray();

            res.status(200).json(datos);

        } catch (error) {

            res.status(500).json({
                error: error.message
            });

        }

    });

    router.put('/:id', async (req, res) => {

        try {

            const resultado = await collection.updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: req.body }
            );

            if (resultado.matchedCount === 0) {
                return res.status(404).json({
                    mensaje: 'Seguidor no encontrado'
                });
            }

            res.status(200).json({
                mensaje: 'Seguidor actualizado correctamente'
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
                    mensaje: 'Seguidor no encontrado'
                });
            }

            res.status(200).json({
                mensaje: 'Seguidor eliminado correctamente'
            });

        } catch (error) {

            res.status(500).json({
                error: error.message
            });

        }

    });

    return router;

};