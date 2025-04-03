const express = require('express');
const app = express();
const routes = require ("./routes/routes");
const PORT = 3000;
const mysql = require('mysql2');

app.use("/", routes);

app.listen(PORT,() => {
    console.log('servidor rodando na porta 3000')
});