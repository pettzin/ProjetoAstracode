// Arquivo para gerenciar o perfil do usuário
import { showAlert, showSuccess, showError, showWarning } from './notification-controller.js';

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregado - inicializando scripts de perfil de usuário")

  // Funções de autenticação
  function getUsuarioLogado() {
    const usuarioLogado = localStorage.getItem("usuarioLogado")
    return usuarioLogado ? JSON.parse(usuarioLogado) : null
  }

  window.realizarLogout = () => {
    localStorage.removeItem("usuarioLogado")
    window.location.href = "login.html"
  }

  function atualizarUsuario(dadosAtualizados) {
    // Obter array de usuários do localStorage
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || []

    // Encontrar o índice do usuário
    const index = usuarios.findIndex((u) => u.email === dadosAtualizados.email)

    if (index === -1) {
      showError("Usuário não encontrado!")
      return false
    }

    // Atualizar os dados do usuário
    usuarios[index] = { ...usuarios[index], ...dadosAtualizados }

    // Salvar array atualizado
    localStorage.setItem("usuarios", JSON.stringify(usuarios))

    // Atualizar usuário logado se for o mesmo
    const usuarioLogado = getUsuarioLogado()
    if (usuarioLogado && usuarioLogado.email === dadosAtualizados.email) {
      localStorage.setItem("usuarioLogado", JSON.stringify(usuarios[index]))
    }

    return true
  }

  function alterarSenha(email, senhaAtual, novaSenha) {
    // Obter array de usuários do localStorage
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || []

    // Encontrar o usuário
    const index = usuarios.findIndex((u) => u.email === email && u.senha === senhaAtual)

    if (index === -1) {
      showError("Senha atual incorreta!")
      return false
    }

    // Atualizar a senha
    usuarios[index].senha = novaSenha

    // Salvar array atualizado
    localStorage.setItem("usuarios", JSON.stringify(usuarios))

    // Atualizar usuário logado se for o mesmo
    const usuarioLogado = getUsuarioLogado()
    if (usuarioLogado && usuarioLogado.email === email) {
      usuarioLogado.senha = novaSenha
      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado))
    }

    return true
  }

  function alterarEmail(emailAtual, novoEmail, senha) {
    // Obter array de usuários do localStorage
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || []

    // Verificar se o novo email já está cadastrado
    const emailExistente = usuarios.some((usuario) => usuario.email === novoEmail)
    if (emailExistente) {
      showWarning("Este email já está cadastrado!")
      return false
    }

    // Encontrar o usuário
    const index = usuarios.findIndex((u) => u.email === emailAtual && u.senha === senha)

    if (index === -1) {
      showError("Senha incorreta!")
      return false
    }

    // Atualizar o email
    usuarios[index].email = novoEmail

    // Salvar array atualizado
    localStorage.setItem("usuarios", JSON.stringify(usuarios))

    // Atualizar usuário logado se for o mesmo
    const usuarioLogado = getUsuarioLogado()
    if (usuarioLogado && usuarioLogado.email === emailAtual) {
      usuarioLogado.email = novoEmail
      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado))
    }

    return true
  }

  // Funções de UI
  window.toggleUserMenu = () => {
    const userMenu = document.getElementById("userMenu")
    if (userMenu) {
      userMenu.classList.toggle("show")
    }
  }

  window.showDialog = (dialogId) => {
    const dialog = document.getElementById(dialogId)
    if (dialog) {
      dialog.style.display = "flex"
    }
  }

  window.closeDialog = (dialogId) => {
    const dialog = document.getElementById(dialogId)
    if (dialog) {
      dialog.style.display = "none"
    }
  }

  function closeUserMenuOnClickOutside(event) {
    const userMenu = document.getElementById("userMenu")
    const userProfile = document.querySelector(".user-profile")

    if (
      userMenu &&
      userMenu.classList.contains("show") &&
      !userMenu.contains(event.target) &&
      !userProfile.contains(event.target)
    ) {
      userMenu.classList.remove("show")
    }
  }

  function atualizarInterfaceUsuario(usuario) {
    // Atualizar nome e papel do usuário
    const userNameElement = document.querySelector(".user-name")
    const userRoleElement = document.querySelector(".user-role")

    if (userNameElement) {
      userNameElement.textContent = usuario.nome
    }

    if (userRoleElement) {
      userRoleElement.textContent = usuario.role || "Usuário"
    }

    // Preencher formulário de edição de perfil
    const editNome = document.getElementById("editNome")
    const editTelefone = document.getElementById("editTelefone")
    const editAvatar = document.getElementById("editAvatar")

    if (editNome) editNome.value = usuario.nome
    if (editTelefone) editTelefone.value = usuario.telefone
    if (editAvatar) editAvatar.src = usuario.avatar || "../img/iconContact.png"

    // Atualizar avatar do usuário no menu
    const userAvatar = document.getElementById("userAvatar")
    if (userAvatar) {
      userAvatar.src = usuario.avatar || "../img/iconContact.png"
    }
  }

  function handleAvatarUpload(event) {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const editAvatar = document.getElementById("editAvatar")
        if (editAvatar) {
          editAvatar.src = e.target.result
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Verificar se o usuário está logado
  const usuarioLogado = getUsuarioLogado()

  if (!usuarioLogado) {
    // Redirecionar para a página de login se não estiver logado
    console.log("Usuário não logado. Redirecionando para login...")
    window.location.href = "login.html"
    return
  }

  console.log("Usuário logado:", usuarioLogado.nome)

  // Atualizar informações do usuário na interface
  atualizarInterfaceUsuario(usuarioLogado)

  // Adicionar evento para fechar o menu ao clicar fora
  document.addEventListener("click", closeUserMenuOnClickOutside)

  // Configurar formulário de edição de perfil
  const editProfileForm = document.getElementById("editProfileForm")
  if (editProfileForm) {
    editProfileForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const nome = document.getElementById("editNome").value
      const telefone = document.getElementById("editTelefone").value
      const avatar = document.getElementById("editAvatar").src

      const dadosAtualizados = {
        ...usuarioLogado,
        nome,
        telefone,
        avatar,
      }

      if (atualizarUsuario(dadosAtualizados)) {
        showSuccess("Perfil atualizado com sucesso!")
        atualizarInterfaceUsuario(dadosAtualizados)
        closeDialog("editProfileDialog")
      }
    })
  }

  // Configurar formulário de alteração de email
  const changeEmailForm = document.getElementById("changeEmailForm")
  if (changeEmailForm) {
    changeEmailForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const novoEmail = document.getElementById("newEmail").value
      const senha = document.getElementById("emailConfirmPassword").value

      if (alterarEmail(usuarioLogado.email, novoEmail, senha)) {
        showSuccess("Email alterado com sucesso!")
        const usuarioAtualizado = getUsuarioLogado()
        atualizarInterfaceUsuario(usuarioAtualizado)
        closeDialog("changeEmailDialog")
      }
    })
  }

  // Configurar formulário de alteração de senha
  const changePasswordForm = document.getElementById("changePasswordForm")
  if (changePasswordForm) {
    changePasswordForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const senhaAtual = document.getElementById("currentPassword").value
      const novaSenha = document.getElementById("newPassword").value
      const confirmarSenha = document.getElementById("confirmNewPassword").value

      if (novaSenha !== confirmarSenha) {
        showWarning("As senhas não coincidem!")
        return
      }

      if (alterarSenha(usuarioLogado.email, senhaAtual, novaSenha)) {
        showSuccess("Senha alterada com sucesso!")
        closeDialog("changePasswordDialog")
      }
    })
  }

  // Configurar upload de avatar
  const avatarInput = document.getElementById("editAvatarInput")
  if (avatarInput) {
    avatarInput.addEventListener("change", handleAvatarUpload)
  }
})