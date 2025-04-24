// Arquivo principal para login e cadastro
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregado - inicializando scripts de login/cadastro")

  // Sistema de notificações integrado
  setupNotificationSystem();

  // Configurar sistema de notificações
  function setupNotificationSystem() {
    // Criar container para notificações se não existir
    let notificationContainer = document.getElementById('notificationContainer');
    
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.id = 'notificationContainer';
      notificationContainer.className = 'notification-container';
      document.body.appendChild(notificationContainer);
      
      // Adicionar estilos para notificações
      if (!document.getElementById('notificationStyles')) {
        const styles = document.createElement('style');
        styles.id = 'notificationStyles';
        document.head.appendChild(styles);
      }
    }

    // Função para mostrar notificações
    window.showNotification = function(message, type = 'info', duration = 0) {
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

    // Função para remover notificação com animação
    function removeNotification(notification) {
      notification.style.animation = 'fade-out 0.3s ease-in forwards';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }

    // Funções para tipos específicos de notificações
    window.showAlert = function(message) {
      return window.showNotification(message, 'info');
    };
    
    window.showError = function(message) {
      return window.showNotification(message, 'error');
    };
    
    window.showSuccess = function(message) {
      return window.showNotification(message, 'success', 3000);
    };
    
    window.showWarning = function(message) {
      return window.showNotification(message, 'warning');
    };
    
    window.showConfirm = function(message) {
      return new Promise((resolve) => {
        const notification = window.showNotification(message, 'confirm');
        notification.onConfirm = () => resolve(true);
        notification.onCancel = () => resolve(false);
      });
    };

    // Sobrescrever função de alerta original
    const originalAlert = window.alert;
    window.alert = function(message) {
      return window.showAlert(message);
    };
  }

  // Funções de UI
  window.mudarTab = (tabId) => {
    console.log("Mudando para a aba:", tabId)

    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active")
    })

    document.querySelectorAll(".tab-pane").forEach((pane) => {
      pane.classList.remove("active")
    })

    const tabBtn = document.getElementById(tabId + "-tab")
    const tabPane = document.getElementById(tabId)

    if (!tabBtn || !tabPane) {
      console.error("Elementos da aba não encontrados:", tabId)
      return
    }

    tabBtn.classList.add("active")
    tabPane.classList.add("active")
  }

  window.visibilidadeSenha = (inputId) => {
    const passwordInput = document.getElementById(inputId)
    const icon = document.getElementById(inputId + "Icon")

    if (!passwordInput || !icon) {
      console.error("Elementos de senha não encontrados:", inputId)
      return
    }

    if (passwordInput.type === "password") {
      passwordInput.type = "text"
      icon.classList.remove("fa-eye")
      icon.classList.add("fa-eye-slash")
    } else {
      passwordInput.type = "password"
      icon.classList.remove("fa-eye-slash")
      icon.classList.add("fa-eye")
    }
  }

  // Funções de validação
  function validarNome(nome) {
    const regexNome = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s]+$/
    return regexNome.test(nome)
  }

  function validarEmail(email) {
    const regexEmail = /^[a-zA-Z0-9_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
    return regexEmail.test(email)
  }

  function validarTelefone(telefone) {
    return telefone.length >= 14
  }

  function validarSenha(senha) {
    const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/
    return regexSenha.test(senha)
  }

  function formatarTelefone(input) {
    const valor = input.value.replace(/\D/g, "")
    let resultado = ""

    if (valor.length > 0) {
      resultado = "(" + valor.substring(0, Math.min(2, valor.length))
    }

    if (valor.length > 2) {
      resultado += ") " + valor.substring(2, Math.min(7, valor.length))
    }

    if (valor.length > 7) {
      resultado += "-" + valor.substring(7, Math.min(11, valor.length))
    }

    input.value = resultado
  }

  // Funções de autenticação
  function salvarUsuario(nome, email, telefone, senha) {
    console.log("Salvando usuário:", { nome, email, telefone })

    // Verificar se já existe um array de usuários
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || []

    // Verificar se o email já está cadastrado
    const emailExistente = usuarios.some((usuario) => usuario.email === email)
    if (emailExistente) {
      showError("Este email já está cadastrado!")
      return false
    }

    // Adicionar novo usuário
    const novoUsuario = {
      nome: nome,
      email: email,
      telefone: telefone,
      senha: senha,
      avatar: "../img/iconContact.png", // Avatar padrão
      role: "Usuário", // Papel padrão
    }

    usuarios.push(novoUsuario)

    // Salvar array atualizado
    localStorage.setItem("usuarios", JSON.stringify(usuarios))
    console.log("Usuário salvo com sucesso!")
    return true
  }

  function verificarLogin(email, senha) {
    // Obter array de usuários do localStorage
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || []

    // Verificar se existe um usuário com o email e senha fornecidos
    const usuarioEncontrado = usuarios.find((usuario) => usuario.email === email && usuario.senha === senha)

    return usuarioEncontrado
  }

  // Configurar eventos
  const telefoneInput = document.querySelector('input[type="tel"]')
  if (telefoneInput) {
    console.log("Input de telefone encontrado")
    telefoneInput.addEventListener("input", function () {
      formatarTelefone(this)
    })
  } else {
    console.error("Input de telefone não encontrado!")
  }

  // Formulário de cadastro
  const cadastroForm = document.getElementById("cadastroForm")
  if (cadastroForm) {
    console.log("Formulário de cadastro encontrado")

    cadastroForm.addEventListener("submit", function (e) {
      e.preventDefault()
      console.log("Formulário de cadastro enviado!")

      // Obter valores dos campos
      const nomeInput = this.querySelector('input[placeholder="Nome completo"]')
      const emailInput = this.querySelector('input[type="email"]')
      const telefoneInput = this.querySelector('input[type="tel"]')
      const senhaInput = document.getElementById("cadastroSenha")
      const confirmarSenhaInput = document.getElementById("confirmarSenha")

      const nome = nomeInput.value
      const email = emailInput.value
      const telefone = telefoneInput.value
      const senha = senhaInput.value
      const confirmarSenha = confirmarSenhaInput.value

      console.log("Valores obtidos:", { nome, email, telefone })

      // Validar nome
      if (!validarNome(nome)) {
        showWarning("Nome inválido. Use apenas letras.")
        return
      }

      // Validar email
      if (!validarEmail(email)) {
        showWarning("Email inválido. Use apenas letras, números, _ e . antes do @")
        return
      }

      // Validar telefone
      if (!validarTelefone(telefone)) {
        showWarning("Telefone inválido. Formato esperado: (XX) XXXXX-XXXX")
        return
      }

      // Validar senha
      if (!validarSenha(senha)) {
        showWarning("A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula e um caractere especial.")
        return
      }

      if (senha !== confirmarSenha) {
        showWarning("As senhas não coincidem!")
        return
      }

      if (salvarUsuario(nome, email, telefone, senha)) {
        showSuccess("Cadastro realizado com sucesso!")
        this.reset()
        window.mudarTab("login")
      }
    })
  } else {
    console.error("Formulário de cadastro não encontrado!")
  }

  // Formulário de login
  const loginForm = document.getElementById("loginForm")
  if (loginForm) {
    console.log("Formulário de login encontrado")

    loginForm.addEventListener("submit", function (e) {
      e.preventDefault()
      console.log("Formulário de login enviado!")

      const emailInput = this.querySelector('input[placeholder="Email"]')
      const senhaInput = document.getElementById("loginSenha")
      
      const email = emailInput.value
      const senha = senhaInput.value

      const usuario = verificarLogin(email, senha)

      if (usuario) {
        localStorage.setItem("usuarioLogado", JSON.stringify(usuario))
        console.log("Login bem-sucedido! Redirecionando...")
        
        showSuccess("Login bem-sucedido! Redirecionando...")
        
        // Redirecionar para a página home após a notificação
        setTimeout(() => {
          window.location.href = "home.html"
        }, 1500)
      } else {
        showError("Email ou senha incorretos!")
      }
    })
  } else {
    console.error("Formulário de login não encontrado!")
  }
})