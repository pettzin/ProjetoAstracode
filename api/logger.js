// Logger Module
// Responsável por registrar logs no servidor

const fs = require('fs');
const path = require('path');

// Diretório de logs
const logDir = path.join(__dirname, '..', 'logs');

// Criar diretório de logs se não existir
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Arquivo de log
const logFile = path.join(logDir, 'contacts.log');

// Inicializar arquivo de log se não existir
if (!fs.existsSync(logFile)) {
  fs.writeFileSync(logFile, '');
}

/**
 * Formata a data atual no horário local brasileiro
 * @returns {string} - Data formatada (DD/MM/YYYY HH:MM:SS)
 */
const getLocalTimestamp = () => {
  const now = new Date();
  
  return now.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

/**
 * Registra uma ação no log
 * @param {string} action - Ação realizada (create, update, delete)
 * @param {string} userId - ID do usuário que realizou a ação
 * @param {object} data - Dados relacionados à ação
 */
const logAction = (action, userId = 'system', data = {}) => {
  const timestamp = getLocalTimestamp();
  
  const logEntry = {
    timestamp,
    action,
    userId,
    data
  };
  
  const logText = `[${timestamp}] [${action.toUpperCase()}] [User: ${userId}] ${JSON.stringify(data)}\n`;
  
  try {
    fs.appendFileSync(logFile, logText);
    return true;
  } catch (error) {
    console.error('Erro ao registrar log:', error);
    return false;
  }
};

/**
 * Lê os logs do arquivo
 * @param {number} limit - Limite de linhas a serem retornadas
 * @returns {Array} - Array de logs
 */
const getLogs = (limit = 100) => {
  try {
    const content = fs.readFileSync(logFile, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    // Retorna as últimas 'limit' linhas
    return lines.slice(-limit);
  } catch (error) {
    console.error('Erro ao ler logs:', error);
    return [];
  }
};

module.exports = {
  logAction,
  getLogs
};