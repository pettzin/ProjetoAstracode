const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 3306;

// Middleware para parsear o corpo da requisição como JSON
app.use(bodyParser.json());

// Configuração da conexão com o MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // substitua pelo seu usuário do MySQL
  password: 'mysql3306', // substitua pela sua senha do MySQL
  database: 'agenda' // substitua pelo nome do seu banco de dados
});

// Conectar ao banco de dados
connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL');
});

// Rota para inserir dados no banco de dados
app.post('/inserir', (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).send('Todos os campos (nome, descricao, preco) são obrigatórios.');
  }

  const query = 'INSERT INTO itens (nome, email, telefone) VALUES (?, ?, ?)';
  connection.query(query, [name, email, phone], (err, results) => {
    if (err) {
      console.error('Erro ao inserir item no banco de dados:', err);
      return res.status(500).send('Erro ao salvar o item.');
    }

    res.status(201).send('Item salvo com sucesso!');
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});