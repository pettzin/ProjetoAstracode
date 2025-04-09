const express = require("express")
const router = express.Router()
const db = require("../db/dbconnection.js")
const bodyParser = require("body-parser")
const cors = require("cors")
const logger = require('../logger');

router.use(cors())
router.use(bodyParser.json({ limit: "50mb" }))

// Rota para obter todos os contatos
router.get("/api/contatos", (req, res) => {
  db.query("SELECT * FROM contatos ORDER BY nome", (err, results) => {
    if (err) {
      console.error("Erro ao buscar contatos:", err)
      return res.status(500).send("Erro ao buscar os contatos.")
    }
    res.json(results)
  })
})

// Rota para obter um contato específico por ID
router.get("/api/contatos/:id", (req, res) => {
  const id = req.params.id
  db.query("SELECT * FROM contatos WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Erro ao buscar contato:", err)
      return res.status(500).send("Erro ao buscar o contato.")
    }
    if (results.length === 0) {
      return res.status(404).send("Contato não encontrado.")
    }
    res.json(results[0])
  })
})

// Modifique a rota POST /api/insert para não exigir o email como obrigatório

router.post("/api/insert", (req, res) => {
  const { nome, sobrenome, email, telefone, grupo, imagem } = req.body

  // Remova o email da validação de campos obrigatórios
  if (!nome || !telefone) {
    return res.status(400).send("Os campos nome e telefone são obrigatórios.")
  }

  const query =
    "INSERT INTO contatos (nome, sobrenome, email, telefone, grupo, imagem, data_criacao) VALUES (?, ?, ?, ?, ?, ?, NOW())"
  db.query(query, [nome, sobrenome || "", email || "", telefone, grupo || "todos", imagem || null], (err, result) => {
    if (err) {
      console.error("Erro ao inserir item no banco de dados:", err)
      return res.status(500).send("Erro ao salvar o item.")
    }

    // Registrar log de criação de contato
    logger.logAction('create', 'system', { 
      id: result ? result.insertId : 'desconhecido',
      nome, 
      sobrenome,
      email,
      telefone,
      grupo: grupo || "todos",
      imagem
    });

    res.status(201).send("Item salvo com sucesso!")
  })
})

// Rota para atualizar um contato existente
router.put("/api/update/:id", (req, res) => {
  const id = req.params.id
  const { nome, sobrenome, email, telefone, grupo, imagem } = req.body

  if (!nome || !telefone) {
    return res.status(400).send("Os campos nome e telefone são obrigatórios.")
  }

  const query =
    "UPDATE contatos SET nome = ?, sobrenome = ?, email = ?, telefone = ?, grupo = ?, imagem = ? WHERE id = ?"
  db.query(query, [nome, sobrenome || "", email || "", telefone, grupo || "todos", imagem || null, id], (err, result) => {
    if (err) {
      console.error("Erro ao atualizar item no banco de dados:", err)
      return res.status(500).send("Erro ao atualizar o item.")
    }

    // Registrar log de atualização de contato
    logger.logAction('update', 'system', { 
      id: result ? result.updatetId : 'desconhecido',
      nome, 
      sobrenome,
      email,
      telefone,
      grupo: grupo || "todos",
      imagem
    });

    res.send("Item atualizado com sucesso!")
  })
})

// Rota para excluir um contato
router.delete("/api/delete/:id", (req, res) => {
  const id = req.params.id
  db.query("DELETE FROM contatos WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erro ao excluir item do banco de dados:", err)
      return res.status(500).send("Erro ao excluir o item.")
    }

    // Registrar log de exclusão de contato
    logger.logAction('delete', 'system', { 
      id: id,
      mensagem: `Contato ID ${id} foi excluído`
    });

    res.send("Item excluído com sucesso!")
  })
})

// Adicionar nova rota para obter logs
router.get("/api/logs", (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const logs = logger.getLogs(limit);
  res.json(logs);
})

module.exports = router