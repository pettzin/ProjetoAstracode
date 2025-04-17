// UI Controller
// Responsável por manipulação da interface do usuário

/**
 * Função para alternar entre as abas
 * @param {string} tabId - ID da aba a ser mostrada
 */
export const mudarTab = (tabId) => {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active")
  })

  document.querySelectorAll(".tab-pane").forEach((pane) => {
    pane.classList.remove("active")
  })

  document.getElementById(tabId + "-tab").classList.add("active")
  document.getElementById(tabId).classList.add("active")
}

/**
 * Função para mostrar/ocultar senha
 * @param {string} inputId - ID do input de senha
 */
export const visibilidadeSenha = (inputId) => {
  const passwordInput = document.getElementById(inputId)
  const icon = document.getElementById(inputId + "Icon")

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

/**
 * Função para mostrar/ocultar o menu do usuário
 */
export const toggleUserMenu = () => {
  const userMenu = document.getElementById("userMenu")
  if (userMenu) {
    userMenu.classList.toggle("show")
  }
}

/**
 * Função para fechar o menu do usuário quando clicar fora
 * @param {Event} event - Evento de clique
 */
export const closeUserMenuOnClickOutside = (event) => {
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

/**
 * Função para mostrar um diálogo
 * @param {string} dialogId - ID do diálogo a ser mostrado
 */
export const showDialog = (dialogId) => {
  const dialog = document.getElementById(dialogId)
  if (dialog) {
    dialog.style.display = "flex"
  }
}

/**
 * Função para fechar um diálogo
 * @param {string} dialogId - ID do diálogo a ser fechado
 */
export const closeDialog = (dialogId) => {
  const dialog = document.getElementById(dialogId)
  if (dialog) {
    dialog.style.display = "none"
  }
}

/**
 * Função para fechar todos os diálogos
 */
export const closeAllDialogs = () => {
  const dialogs = document.querySelectorAll(".dialog")
  dialogs.forEach((dialog) => {
    dialog.style.display = "none"
  })
}