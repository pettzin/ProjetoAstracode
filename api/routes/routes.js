const express = require('express');
const router = express.Router();
const db = require("../db/dbconnection.js");
const controller = require("../controller/appcontroller.js");
const bodyParser = require('body-parser');

router.use(bodyParser.json());

// API - Inserir um contato
router.post('/api/insert', (req, res) => {
    const { nome, email, telefone } = req.body;

    if (!nome || !email || !telefone) {
        return res.status(400).send('Todos os campos (nome, email, telefone) são obrigatórios.');
    }

    const query = 'INSERT INTO contatos (nome, email, telefone) VALUES (?, ?, ?)';
    db.query(query, [nome, email, telefone], (err) => {
        if (err) {
            console.error('Erro ao inserir item no banco de dados:', err);
            return res.status(500).send('Erro ao salvar o item.');
        }

        res.status(201).send('Item salvo com sucesso!');
    });
});

// API - Listar todos os contatos
router.get('/api/select', (req, res) => {
    const query = 'SELECT * FROM contatos';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar itens no banco de dados:', err);
            return res.status(500).send('Erro ao buscar os itens.');
        }

        res.status(200).json(results);
    });
});

// API - Atualizar um contato
router.put('/api/update/:id', (req, res) => {
    const { id } = req.params;
    const { nome, email, telefone } = req.body;

    if (!nome || !email || !telefone) {
        return res.status(400).send('Todos os campos (nome, email, telefone) são obrigatórios.');
    }

    const query = 'UPDATE contatos SET nome = ?, email = ?, telefone = ? WHERE id = ?';
    db.query(query, [nome, email, telefone, id], (err) => {
        if (err) {
            console.error('Erro ao atualizar item no banco de dados:', err);
            return res.status(500).send('Erro ao atualizar o item.');
        }

        res.status(200).send('Item atualizado com sucesso!');
    });
});

// API - Deletar um contato
router.delete('/api/delete/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM contatos WHERE id = ?';
    db.query(query, [id], (err) => {
        if (err) {
            console.error('Erro ao deletar item no banco de dados:', err);
            return res.status(500).send('Erro ao deletar o item.');
        }

        res.status(200).send('Item deletado com sucesso!');
    });
});

module.exports = router;
