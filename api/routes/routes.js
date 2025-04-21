const express = require("express")
const router = express.Router()
const db = require("../db/dbconnection.js")
const bodyParser = require("body-parser")
const cors = require("cors")
const logger = require("../logger")

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
    logger.logAction("create", "system", {
      id: result ? result.insertId : "desconhecido",
      nome,
      sobrenome,
      email,
      telefone,
      grupo: grupo || "todos",
      imagem,
    })

    res.status(201).send("Item salvo com sucesso!")
  })
})

// Rota para atualizar um contato existente
router.put("/api/update/:id", (req, res) => {
  const id = req.params.id
  const { nome, sobrenome, email, telefone, grupo, imagem } = req.body

  // Construir a query dinamicamente com base nos campos fornecidos
  const updateFields = []
  const updateValues = []

  // Verificar quais campos foram fornecidos e adicioná-los à query
  if (nome !== undefined) {
    updateFields.push("nome = ?")
    updateValues.push(nome)
  }

  if (sobrenome !== undefined) {
    updateFields.push("sobrenome = ?")
    updateValues.push(sobrenome || "")
  }

  if (email !== undefined) {
    updateFields.push("email = ?")
    updateValues.push(email || "")
  }

  if (telefone !== undefined) {
    updateFields.push("telefone = ?")
    updateValues.push(telefone)
  }

  if (grupo !== undefined) {
    updateFields.push("grupo = ?")
    updateValues.push(grupo || "todos")
  }

  if (imagem !== undefined) {
    updateFields.push("imagem = ?")
    updateValues.push(imagem || null)
  }

  // Se não houver campos para atualizar, retornar erro
  if (updateFields.length === 0) {
    return res.status(400).send("Nenhum campo fornecido para atualização.")
  }

  // Construir a query final
  const query = `UPDATE contatos SET ${updateFields.join(", ")} WHERE id = ?`

  // Adicionar o ID ao final dos valores
  updateValues.push(id)

  // Executar a query
  db.query(query, updateValues, (err, result) => {
    if (err) {
      console.error("Erro ao atualizar item no banco de dados:", err)
      return res.status(500).send("Erro ao atualizar o item.")
    }

    // Registrar log de atualização de contato
    logger.logAction("update", "system", {
      id: id,
      campos_atualizados: Object.keys(req.body).join(", "),
      grupo: grupo,
    })

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
    logger.logAction("delete", "system", {
      id: id,
      mensagem: `Contato ID ${id} foi excluído`,
    })

    res.send("Item excluído com sucesso!")
  })
})

// Rota para obter todos os grupos únicos
router.get("/api/grupos", (req, res) => {
  db.query("SELECT DISTINCT grupo FROM contatos WHERE grupo IS NOT NULL AND grupo != 'todos'", (err, results) => {
    if (err) {
      console.error("Erro ao buscar grupos:", err)
      return res.status(500).send("Erro ao buscar os grupos.")
    }

    // Transformar resultados em um array de nomes de grupos
    const grupos = results.map((row) => row.grupo)
    res.json(grupos)
  })
})

// Adicionar nova rota para obter logs
router.get("/api/logs", (req, res) => {
  const limit = Number.parseInt(req.query.limit) || 100
  const logs = logger.getLogs(limit)
  res.json(logs)
})

module.exports = router