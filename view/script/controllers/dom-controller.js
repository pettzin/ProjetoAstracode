// DOM Elements Controller
// Responsável por gerenciar todos os elementos DOM da aplicação

const DEFAULT_AVATAR = "../img/iconContact.png"

// Elementos DOM centralizados
export const elements = {
  contactsGrid: document.getElementById("contactsGrid"),
  contactsList: document.getElementById("contactsList"),
  searchInput: document.getElementById("searchInput"),
  sortButton: document.getElementById("sortButton"),
  sortSelect: document.getElementById("sortSelect"),
  viewOptions: document.querySelectorAll(".view-option"),
  dialogs: {
    message: document.getElementById("messageDialog"),
    profile: document.getElementById("profileDialog"),
    group: document.getElementById("groupDialog"),
  },
  buttons: {
    addContact: document.getElementById("addContactBtn"),
    addGroup: document.getElementById("addGroupBtn"),
    email: document.getElementById("emailBtn"),
    sendMessage: document.getElementById("sendMessageBtn"),
    sendMessageWhatts: document.getElementById("sendMessagewhatts"),
    profileMessage: document.getElementById("profileMessageBtn"),
    profileDelete: document.getElementById("profileDeleteBtn"),
    profileSave: document.getElementById("profileSaveBtn"),
    saveGroup: document.getElementById("saveGroupBtn"),
    deleteGroup: document.getElementById("deleteGroupBtn"),
  },
  inputs: {
    avatar: document.getElementById("avatarInput"),
    profileCategory: document.getElementById("profileCategory"),
    contactSelect: document.getElementById("contactSelect"),
  },
  loading: document.getElementById("loadingSpinner"),
  navTabs: document.getElementById("navTabs"),
}

/**
 * Verifica se um elemento existe no DOM
 * @param {HTMLElement} element - O elemento a ser verificado
 * @param {string} name - Nome do elemento para log
 * @returns {boolean} - Se o elemento existe
 */
export const elementExists = (element, name) => {
  if (!element) {
    console.error(`Elemento ${name} não encontrado no DOM`)
    return false
  }
  return true
}

/**
 * Shows the loading spinner
 */
export const showLoading = () => {
  if (elementExists(elements.loading, "loading")) {
    elements.loading.style.display = "flex"
  }
}

/**
 * Hides the loading spinner
 */
export const hideLoading = () => {
  if (elementExists(elements.loading, "loading")) {
    elements.loading.style.display = "none"
  }
}

/**
 * Closes all dialogs
 */
export const closeDialogs = () => {
  Object.entries(elements.dialogs).forEach(([name, dialog]) => {
    if (elementExists(dialog, name)) {
      dialog.style.display = "none"
    }
  })
}

