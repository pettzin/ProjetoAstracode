const express = require('express');
const router = express.Router();
const db = require("../db/dbconnection.js");
const bodyParser = require('body-parser');
const logger = require('../logger');
const fs = require('fs');
const path = require('path');
console.log('Módulo path carregado:', path);
const cors = require('cors');

router.use(cors());
router.use(bodyParser.json({ limit: '50mb' }));

// API - Inserir um contato
router.post('/api/insert', (req, res) => {
    const { nome, email, telefone, grupo, imagem } = req.body;

    if (!nome || !email || !telefone) {
        logger.warning('Tentativa de inserir contato com campos obrigatórios faltando', 'API Route', { nome, email, telefone });
        return res.status(400).send('Os campos nome, email e telefone são obrigatórios.');
    }
    logger.info('Iniciando inserção de contato', 'API Route', { nome, email, telefone, grupo });

    const query = 'INSERT INTO contatos (nome, email, telefone, grupo, imagem, data_criacao) VALUES (?, ?, ?, ?, ?, NOW())';
    db.query(query, [nome, email, telefone, grupo || 'outros', imagem || null], (err) => {
        if (err) {
            logger.error('Erro ao inserir contato no banco de dados', 'DB Error', { error: err.message, query });
            console.error('Erro ao inserir item no banco de dados:', err);
            return res.status(500).send('Erro ao salvar o item.');
        }

        logger.info('Contato inserido com sucesso', 'API Route', { nome, email });
        res.status(201).send('Item salvo com sucesso!');
    });
});

// API - Listar todos os contatos
router.get('/api/select', (req, res) => {
    logger.info('Buscando todos os contatos', 'API Route');

    const query = 'SELECT * FROM contatos';
    const startTime = Date.now();

    db.query(query, (err, results) => {
        const duration = Date.now() - startTime;

        if (err) {
            logger.error('Erro ao buscar contatos no banco de dados', 'DB Error', { error: err.message, query });
            console.error('Erro ao buscar itens no banco de dados:', err);
            return res.status(500).send('Erro ao buscar os itens.');
        }
        
        logger.info(`Retornando ${results.length} contatos`, 'API Route', { duration });
        
        // Log de performance se a consulta for lenta
        if (duration > 500) {
            logger.warning(`Consulta lenta (${duration}ms)`, 'Performance', { query });
        }

        res.status(200).json(results);
    });
});

// API - Atualizar um contato
router.put('/api/update/:id', (req, res) => {
    const { id } = req.params;
    const { nome, email, telefone, grupo, imagem } = req.body;

    if (!nome || !email || !telefone) {
        return res.status(400).send('Os campos nome, email e telefone são obrigatórios.');
    }

    const query = 'UPDATE contatos SET nome = ?, email = ?, telefone = ?, grupo = ?, imagem = ? WHERE id = ?';
    db.query(query, [nome, email, telefone, grupo || 'outros', imagem || null, id], (err) => {
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

// API - Listar grupos
router.get('/api/groups', (req, res) => {
    const query = 'SELECT DISTINCT grupo FROM contatos WHERE grupo IS NOT NULL';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar grupos no banco de dados:', err);
            return res.status(500).send('Erro ao buscar os grupos.');
        }

        const groups = results.map(row => row.grupo);
        res.status(200).json(groups);
    });
});

// API - Receber logs do frontend
router.post('/log', (req, res) => {
    try {
        const { timestamp, level, message, source, details } = req.body;
        
        // Registrar o log usando o logger do servidor
        logger[level](message, `Frontend: ${source}`, details);
        
        res.status(200).send('Log registrado com sucesso');
    } catch (error) {
        console.error('Erro ao registrar log do frontend:', error);
        res.status(500).send('Erro ao registrar log');
    }
});

// API - Buscar logs
router.get('/logs', (req, res) => {
    try {
        const type = req.query.type || 'app';
        const limit = parseInt(req.query.limit) || 100;
        
        // Verificar se o tipo de log é válido
        if (!logger.logFiles[type]) {
            return res.status(400).send('Tipo de log inválido');
        }
        
        // Ler arquivo de log
        const content = fs.readFileSync(logger.logFiles[type], 'utf-8');
        const lines = content.split('\n').filter(line => line.trim() !== '');
        
        // Obter as últimas 'limit' linhas
        const lastLines = lines.slice(-limit);
        
        res.status(200).json(lastLines);
    } catch (error) {
        console.error('Erro ao buscar logs:', error);
        res.status(500).send('Erro ao buscar logs');
    }
});

// API - Baixar logs
router.get('/logs/download', (req, res) => {
    try {
        const type = req.query.type || 'app';
        
        // Verificar se o tipo de log é válido
        if (!logger.logFiles[type]) {
            return res.status(400).send('Tipo de log inválido');
        }
        
        // Ler arquivo de log
        const content = fs.readFileSync(logger.logFiles[type], 'utf-8');
        
        // Configurar cabeçalhos para download
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="logs-${type}-${new Date().toISOString().split('T')[0]}.txt"`);
        
        res.status(200).send(content);
    } catch (error) {
        console.error('Erro ao baixar logs:', error);
        res.status(500).send('Erro ao baixar logs');
    }
});

module.exports = router;