// Notification Controller
// Responsável por exibir notificações e alertas personalizados

// Armazenar notificações na sessionStorage para persistir entre atualizações
const saveNotification = (message, type, duration) => {
  if (window.sessionStorage) {
    const notification = { message, type, duration, timestamp: Date.now() };
    sessionStorage.setItem('lastNotification', JSON.stringify(notification));
  }
};

// Verificar se há notificações pendentes ao carregar a página
const checkPendingNotifications = () => {
  if (window.sessionStorage && sessionStorage.getItem('lastNotification')) {
    try {
      const notification = JSON.parse(sessionStorage.getItem('lastNotification'));
      const timePassed = Date.now() - notification.timestamp;
      
      // Se a notificação foi criada há menos de 10 segundos, mostrá-la novamente
      if (timePassed < 10000) {
        const remainingTime = Math.max(notification.duration - timePassed, 3000);
        showNotification(notification.message, notification.type, remainingTime);
      }
      
      // Limpar a notificação pendente
      sessionStorage.removeItem('lastNotification');
    } catch (e) {
      console.warn('Erro ao restaurar notificação:', e);
      sessionStorage.removeItem('lastNotification');
    }
  }
};

// Executar verificação quando o DOM estiver pronto
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkPendingNotifications);
  } else {
    setTimeout(checkPendingNotifications, 100);
  }
}

/**
 * Exibe uma notificação personalizada no estilo de alerta
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo de notificação (success, error, warning, info)
 * @param {number} duration - Duração em ms (0 para exigir confirmação)
 */
export const showNotification = (message, type = 'info', duration = 5000) => {
  // Salvar notificação para recuperar em caso de atualização da página
  saveNotification(message, type, duration);
    // Criar elemento de notificação se não existir
    let notificationContainer = document.getElementById('notificationContainer');
    
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.id = 'notificationContainer';
      notificationContainer.className = 'notification-container';
      document.body.appendChild(notificationContainer);
    }
    
    // Garantir que o container esteja sempre na frente
    notificationContainer.style.zIndex = '9999';
      
    // Adicionar estilos se não existirem
    if (!document.getElementById('notificationStyles')) {
        const styles = document.createElement('style');
        styles.id = 'notificationStyles';
        styles.textContent = `
          .notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 350px;
            pointer-events: none; /* Permite clicar através do container */
          }
          .notification {
            padding: 15px 20px;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slide-in 0.3s ease-out;
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: white;
            font-family: Arial, sans-serif;
            pointer-events: auto; /* Restaura eventos de cliques nas notificações */
            opacity: 1;
            will-change: transform, opacity; /* Otimiza para animações */
          }
          .notification-content {
            flex: 1;
            margin-right: 10px;
          }
          .notification-close {
            background: transparent;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 18px;
            opacity: 0.8;
            transition: opacity 0.2s;
          }
          .notification-close:hover {
            opacity: 1;
          }
          .notification-success {
            background-color: #4CAF50;
          }
          .notification-error {
            background-color: #F44336;
          }
          .notification-warning {
            background-color: #FF9800;
          }
          .notification-info {
            background-color: #2196F3;
          }
          .notification-confirm {
            background-color: #673AB7;
          }
          .notification-buttons {
            display: flex;
            gap: 10px;
            margin-top: 10px;
          }
          .notification-button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            font-weight: bold;
            transition: background 0.2s;
          }
          .notification-button:hover {
            background: rgba(255, 255, 255, 0.3);
          }
          @keyframes slide-in {
            from { transform: translateX(50px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes fade-out {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(50px); opacity: 0; }
          }
          /* Adicionar classe para prevenção de animação */
          .notification-no-animation {
            animation: none !important;
          }
        `;
        document.head.appendChild(styles);
      }
  
    // Manter apenas uma notificação de cada tipo para evitar sobreposição
    const existingNotifications = document.querySelectorAll(`.notification-${type}`);
    if (existingNotifications.length > 0 && type !== 'confirm') {
      for (let i = 0; i < existingNotifications.length; i++) {
        if (document.body.contains(existingNotifications[i])) {
          removeNotification(existingNotifications[i]);
        }
      }
    }
  
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.opacity = '0'; // Iniciar invisível para evitar flashes
    
    // Conteúdo da notificação
    const content = document.createElement('div');
    content.className = 'notification-content';
    content.textContent = message;
    notification.appendChild(content);
    
    // Botão de fechar
    const closeButton = document.createElement('button');
    closeButton.className = 'notification-close';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => removeNotification(notification);
    notification.appendChild(closeButton);
    
    // Se for uma confirmação, adicionar botões
    if (type === 'confirm') {
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'notification-buttons';
      
      const confirmButton = document.createElement('button');
      confirmButton.className = 'notification-button';
      confirmButton.textContent = 'OK';
      confirmButton.onclick = () => {
        removeNotification(notification);
        if (notification.onConfirm) notification.onConfirm();
      };
      
      const cancelButton = document.createElement('button');
      cancelButton.className = 'notification-button';
      cancelButton.textContent = 'Cancelar';
      cancelButton.onclick = () => {
        removeNotification(notification);
        if (notification.onCancel) notification.onCancel();
      };
      
      buttonsContainer.appendChild(confirmButton);
      buttonsContainer.appendChild(cancelButton);
      content.appendChild(buttonsContainer);
    }
    
    // Adicionar ao container
    notificationContainer.appendChild(notification);
    
    // Forçar reflow para garantir que a animação funcione
    notification.offsetHeight;
    
    // Tornar visível com pequeno atraso para garantir renderização suave
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 10);
    
    // Auto-remover após a duração (se não for 0)
    if (duration > 0 && type !== 'confirm') {
      setTimeout(() => {
        if (document.body.contains(notification)) {
          removeNotification(notification);
        }
      }, duration);
    }
    
    // Garantir que a notificação esteja visível
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.display = 'flex';
      }
    }, 50);
    
    return notification;
  };
  
  /**
   * Remove uma notificação com animação
   * @param {HTMLElement} notification - Elemento de notificação
   */
  const removeNotification = (notification) => {
    // Verificar se a notificação ainda existe no DOM antes de tentar remover
    if (!document.body.contains(notification)) {
      return;
    }
    
    // Pausar brevemente antes de iniciar a animação de saída
    notification.style.animation = 'fade-out 0.3s ease-in forwards';
    
    // Garantir que a notificação seja removida mesmo se houver problemas com a animação
    setTimeout(() => {
      try {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      } catch (e) {
        console.warn('Erro ao remover notificação:', e);
      }
    }, 300);
  };
  
  /**
   * Exibe uma mensagem de alerta personalizada (substitui o alert padrão)
   * @param {string} message - Mensagem a ser exibida
   * @param {number} duration - Duração em ms (padrão: 5000ms)
   */
  export const showAlert = (message, duration = 5000) => {
    return showNotification(message, 'info', duration);
  };
  
  /**
   * Exibe uma mensagem de erro personalizada
   * @param {string} message - Mensagem a ser exibida
   * @param {number} duration - Duração em ms (padrão: 5000ms)
   */
  export const showError = (message, duration = 5000) => {
    return showNotification(message, 'error', duration);
  };
  
  /**
   * Exibe uma mensagem de sucesso personalizada
   * @param {string} message - Mensagem a ser exibida
   * @param {number} duration - Duração em ms (padrão: 5000ms)
   */
  export const showSuccess = (message, duration = 5000) => {
    return showNotification(message, 'success', duration);
  };
  
  /**
   * Exibe uma mensagem de aviso personalizada
   * @param {string} message - Mensagem a ser exibida
   * @param {number} duration - Duração em ms (padrão: 5000ms)
   */
  export const showWarning = (message, duration = 5000) => {
    return showNotification(message, 'warning', duration);
  };
  
  /**
   * Exibe uma caixa de confirmação personalizada (substitui o confirm padrão)
   * @param {string} message - Mensagem a ser exibida
   * @returns {Promise} - Promise que resolve para true (confirmado) ou false (cancelado)
   */
  export const showConfirm = (message) => {
    return new Promise((resolve) => {
      const notification = showNotification(message, 'confirm');
      notification.onConfirm = () => resolve(true);
      notification.onCancel = () => resolve(false);
    });
  };
  
  // Verificar notificações pendentes quando o módulo for importado
  setTimeout(checkPendingNotifications, 100);
  
  // Exportar todas as funções
  export default {
    showNotification,
    showAlert,
    showError,
    showSuccess,
    showWarning,
    showConfirm
  };