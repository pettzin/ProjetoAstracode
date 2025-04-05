// Arquivo principal para login e cadastro
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregado - inicializando scripts de login/cadastro")

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
      alert("Este email já está cadastrado!")
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

      if (!nomeInput || !emailInput || !telefoneInput || !senhaInput || !confirmarSenhaInput) {
        console.error("Campos não encontrados!")
        alert("Erro ao processar o formulário. Verifique se todos os campos estão preenchidos.")
        return
      }

      const nome = nomeInput.value
      const email = emailInput.value
      const telefone = telefoneInput.value
      const senha = senhaInput.value
      const confirmarSenha = confirmarSenhaInput.value

      console.log("Valores obtidos:", { nome, email, telefone })

      // Validar nome
      if (!validarNome(nome)) {
        alert("Nome inválido. Use apenas letras.")
        return
      }

      // Validar email
      if (!validarEmail(email)) {
        alert("Email inválido. Use apenas letras, números, _ e . antes do @")
        return
      }

      // Validar telefone
      if (!validarTelefone(telefone)) {
        alert("Telefone inválido. Formato esperado: (XX) XXXXX-XXXX")
        return
      }

      // Validar senha
      if (!validarSenha(senha)) {
        alert("A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula e um caractere especial.")
        return
      }

      if (senha !== confirmarSenha) {
        alert("As senhas não coincidem!")
        return
      }

      if (salvarUsuario(nome, email, telefone, senha)) {
        alert("Cadastro realizado com sucesso!")
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

      if (!emailInput || !senhaInput) {
        console.error("Campos de login não encontrados!")
        alert("Erro ao processar o login. Verifique se todos os campos estão preenchidos.")
        return
      }

      const email = emailInput.value
      const senha = senhaInput.value

      const usuario = verificarLogin(email, senha)

      if (usuario) {
        localStorage.setItem("usuarioLogado", JSON.stringify(usuario))
        console.log("Login bem-sucedido! Redirecionando...")

        // Redirecionar para a página home
        window.location.href = "home.html"
      } else {
        alert("Email ou senha incorretos!")
      }
    })
  } else {
    console.error("Formulário de login não encontrado!")
  }
})

