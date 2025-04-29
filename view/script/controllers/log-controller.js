// Log Controller
// Responsável por registrar logs de ações do usuário

import { API } from './api-controller.js';
import { showError } from './notification-controller.js';

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
 * Registra uma ação no console e opcionalmente envia para o servidor
 * @param {string} action - Tipo de ação (create, update, delete)
 * @param {object} data - Dados relacionados à ação
 * @param {boolean} sendToServer - Se deve enviar o log para o servidor
 */
export const logAction = (action, data, sendToServer = false) => {
  // Registrar no console
  const timestamp = getLocalTimestamp();
  console.log(`[${timestamp}] [${action.toUpperCase()}]`, data);

  // Opcionalmente enviar para o servidor
  if (sendToServer) {
    try {
      fetch(`${API.BASE_URL}/api/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          data,
          timestamp
        })
      }).catch(err => {
        // Usar notificação personalizada em vez de console.log
        showError('Não foi possível enviar o log para o servidor. Verifique sua conexão e tente novamente.');
      });
    } catch (error) {
      // Silenciar erros ou opcionalmente mostrar uma notificação
      showError('Erro ao tentar enviar logs: ' + error.message);
    }
  }
};

/**
 * Registra criação de contato
 * @param {object} contact - Dados do contato criado
 */
export const logContactCreated = (contact) => {
  logAction('create', {
    id: contact.id,
    name: contact.name,
    phone: contact.phone,
    category: contact.category
  });
};

/**
 * Registra atualização de contato
 * @param {object} contact - Dados do contato atualizado
 */
export const logContactUpdated = (contact) => {
  logAction('update', {
    id: contact.id,
    name: contact.name,
    phone: contact.phone,
    category: contact.category
  });
};

/**
 * Registra exclusão de contato
 * @param {number} contactId - ID do contato excluído
 * @param {string} contactName - Nome do contato excluído
 */
export const logContactDeleted = (contactId, contactName) => {
  logAction('delete', {
    id: contactId,
    name: contactName
  });
};

export default {
  logContactCreated,
  logContactUpdated,
  logContactDeleted
};