// Notification Controller
// Responsável por exibir notificações e alertas personalizados

/**
 * Exibe uma notificação personalizada no estilo de alerta
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo de notificação (success, error, warning, info)
 * @param {number} duration - Duração em ms (0 para exigir confirmação)
 */
export const showNotification = (message, type = 'info', duration = 0) => {
    // Criar elemento de notificação se não existir
    let notificationContainer = document.getElementById('notificationContainer');
    
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.id = 'notificationContainer';
      notificationContainer.className = 'notification-container';
      document.body.appendChild(notificationContainer);
      
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
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes fade-out {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
          }
        `;
        document.head.appendChild(styles);
      }
    }
  
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
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
    
    // Auto-remover após a duração (se não for 0)
    if (duration > 0 && type !== 'confirm') {
      setTimeout(() => {
        removeNotification(notification);
      }, duration);
    }
    
    return notification;
  };
  
  /**
   * Remove uma notificação com animação
   * @param {HTMLElement} notification - Elemento de notificação
   */
  const removeNotification = (notification) => {
    notification.style.animation = 'fade-out 0.3s ease-in forwards';
    setTimeout(() => {
      notification.remove();
    }, 300);
  };
  
  /**
   * Exibe uma mensagem de alerta personalizada (substitui o alert padrão)
   * @param {string} message - Mensagem a ser exibida
   */
  export const showAlert = (message) => {
    return showNotification(message, 'info');
  };
  
  /**
   * Exibe uma mensagem de erro personalizada
   * @param {string} message - Mensagem a ser exibida
   */
  export const showError = (message) => {
    return showNotification(message, 'error');
  };
  
  /**
   * Exibe uma mensagem de sucesso personalizada
   * @param {string} message - Mensagem a ser exibida
   */
  export const showSuccess = (message) => {
    return showNotification(message, 'success', 3000);
  };
  
  /**
   * Exibe uma mensagem de aviso personalizada
   * @param {string} message - Mensagem a ser exibida
   */
  export const showWarning = (message) => {
    return showNotification(message, 'warning');
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
  
  // Exportar todas as funções
  export default {
    showNotification,
    showAlert,
    showError,
    showSuccess,
    showWarning,
    showConfirm
  };