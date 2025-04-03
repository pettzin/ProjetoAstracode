/*const express = require('express');
const app = express();
const routes = require ("./routes/routes");
const PORT = 3000;
const mysql = require('mysql2');

app.use("/", routes);

app.listen(PORT,() => {
    console.log('servidor rodando na porta 3000')
});*/

const express = require('express');
const app = express();
const cors = require('cors'); // Se você tiver o pacote cors instalado
const path = require('path');
const logger = require('./logger');
const routes = require("./routes/routes");
const PORT = 3000;

// Middleware para CORS
app.use(cors());
// Ou use a configuração manual se não tiver o pacote cors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Middleware para processar JSON e dados de formulário
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '..')));

// Rota de teste para verificar se o servidor está funcionando
app.get('/api/ping', (req, res) => {
  res.status(200).send('pong');
});

// Usar as rotas da API
app.use("/", routes);

// Iniciar o servidor
app.listen(PORT, () => {
  try {
    logger.info(`Servidor iniciado na porta ${PORT}`, 'Server');
  } catch (error) {
    console.error('Erro ao registrar log:', error);
  }
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
