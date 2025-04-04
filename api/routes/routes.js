const express = require("express")
const router = express.Router()
const db = require("../db/dbconnection.js")
const bodyParser = require("body-parser")
const cors = require("cors")

router.use(cors())
router.use(bodyParser.json({ limit: "50mb" }))

// API - Inserir um contato
router.post("/api/insert", (req, res) => {
  const { nome, sobrenome, email, telefone, grupo, imagem } = req.body

  if (!nome || !email || !telefone) {
    return res.status(400).send("Os campos nome, email e telefone são obrigatórios.")
  }

  const query =
    "INSERT INTO contatos (nome, sobrenome, email, telefone, grupo, imagem, data_criacao) VALUES (?, ?, ?, ?, ?, ?, NOW())"
  db.query(query, [nome, sobrenome || "", email, telefone, grupo || "outros", imagem || null], (err) => {
    if (err) {
      console.error("Erro ao inserir item no banco de dados:", err)
      return res.status(500).send("Erro ao salvar o item.")
    }

    res.status(201).send("Item salvo com sucesso!")
  })
})

// API - Listar todos os contatos
router.get("/api/select", (req, res) => {
  const query = "SELECT * FROM contatos"
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar itens no banco de dados:", err)
      return res.status(500).send("Erro ao buscar os itens.")
    }

    res.status(200).json(results)
  })
})

// API - Atualizar um contato
router.put("/api/update/:id", (req, res) => {
  const { id } = req.params
  const { nome, sobrenome, email, telefone, grupo, imagem } = req.body

  if (!nome || !email || !telefone) {
    return res.status(400).send("Os campos nome, email e telefone são obrigatórios.")
  }

  const query =
    "UPDATE contatos SET nome = ?, sobrenome = ?, email = ?, telefone = ?, grupo = ?, imagem = ? WHERE id = ?"
  db.query(query, [nome, sobrenome || "", email, telefone, grupo || "outros", imagem || null, id], (err) => {
    if (err) {
      console.error("Erro ao atualizar item no banco de dados:", err)
      return res.status(500).send("Erro ao atualizar o item.")
    }

    res.status(200).send("Item atualizado com sucesso!")
  })
})

// API - Deletar um contato
router.delete("/api/delete/:id", (req, res) => {
  const { id } = req.params

  const query = "DELETE FROM contatos WHERE id = ?"
  db.query(query, [id], (err) => {
    if (err) {
      console.error("Erro ao deletar item no banco de dados:", err)
      return res.status(500).send("Erro ao deletar o item.")
    }

    res.status(200).send("Item deletado com sucesso!")
  })
})

// API - Listar grupos
router.get("/api/groups", (req, res) => {
  const query = "SELECT DISTINCT grupo FROM contatos WHERE grupo IS NOT NULL"
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar grupos no banco de dados:", err)
      return res.status(500).send("Erro ao buscar os grupos.")
    }

    const groups = results.map((row) => row.grupo)
    res.status(200).json(groups)
  })
})

module.exports = router

