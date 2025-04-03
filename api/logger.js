const fs = require('fs');
const path = require('path');

// Diretório de logs - coloque na raiz do projeto
const logDir = path.join(__dirname, '..', 'logs');

// Criar diretório de logs se não existir
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Arquivos de log
const logFiles = {
  app: path.join(logDir, 'app.log'),
  error: path.join(logDir, 'error.log'),
  api: path.join(logDir, 'api.log'),
  database: path.join(logDir, 'database.log'),
  performance: path.join(logDir, 'performance.log')
};

// Inicializar arquivos de log se não existirem
Object.values(logFiles).forEach(file => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '');
  }
});

/**
 * Registra uma mensagem de log
 * @param {string} level - Nível do log (info, warning, error)
 * @param {string} message - Mensagem do log
 * @param {string} source - Origem do log
 * @param {object} details - Detalhes adicionais
 */
function log(level, message, source, details = null) {
  const timestamp = new Date().toISOString();
  const logText = `[${timestamp}] [${level.toUpperCase()}] [${source}] ${message}${details ? ` - ${JSON.stringify(details)}` : ''}\n`;
  
  // Adicionar ao log principal
  fs.appendFileSync(logFiles.app, logText);
  
  // Adicionar aos logs específicos
  if (level === 'error') {
    fs.appendFileSync(logFiles.error, logText);
  }
  
  if (source.includes('API') || source.includes('Route')) {
    fs.appendFileSync(logFiles.api, logText);
  }
  
  if (source.includes('DB') || source.includes('Database')) {
    fs.appendFileSync(logFiles.database, logText);
  }
  
  if (source.includes('Performance')) {
    fs.appendFileSync(logFiles.performance, logText);
  }
  
  return true;
}

module.exports = {
  info: (message, source, details = null) => log('info', message, source, details),
  warning: (message, source, details = null) => log('warning', message, source, details),
  error: (message, source, details = null) => log('error', message, source, details),
  logFiles
};