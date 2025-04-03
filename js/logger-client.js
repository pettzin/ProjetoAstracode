/**
 * Cliente de logs para o frontend
 * Este arquivo permite enviar logs do frontend para o servidor
 */
const LoggerClient = {
    /**
     * Envia um log para o servidor
     * @param {string} level - Nível do log (info, warning, error)
     * @param {string} message - Mensagem do log
     * @param {string} source - Origem do log
     * @param {object} details - Detalhes adicionais
     */
    log: function(level, message, source, details = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            source,
            details
        };
        
        // Registrar no console do navegador
        console.log(`[${level.toUpperCase()}] [${source}] ${message}`, details || '');
        
        // Enviar para o servidor
        fetch(`${API.BASE_URL}/api/log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(logEntry)
        }).catch(err => {
            console.error('Erro ao enviar log para o servidor:', err);
        });
    },
    
    /**
     * Registra uma mensagem de informação
     * @param {string} message - Mensagem do log
     * @param {string} source - Origem do log
     * @param {object} details - Detalhes adicionais
     */
    info: function(message, source, details = null) {
        this.log('info', message, source, details);
    },
    
    /**
     * Registra uma mensagem de aviso
     * @param {string} message - Mensagem do log
     * @param {string} source - Origem do log
     * @param {object} details - Detalhes adicionais
     */
    warning: function(message, source, details = null) {
        this.log('warning', message, source, details);
    },
    
    /**
     * Registra uma mensagem de erro
     * @param {string} message - Mensagem do log
     * @param {string} source - Origem do log
     * @param {object} details - Detalhes adicionais
     */
    error: function(message, source, details = null) {
        this.log('error', message, source, details);
    }
};

// Adicionar ao objeto window para acesso global
window.logger = LoggerClient;

// Registrar que o logger foi carregado
console.log('Logger do cliente inicializado');