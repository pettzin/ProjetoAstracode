// Main Application File
// Inicializa a aplicação e configura os event listeners

import { elements, elementExists, closeDialogs } from "./controllers/dom-controller.js"
import { checkApiConnection, fetchContacts } from "./controllers/api-controller.js"
import {
  updateNavTabs,
  renderContacts,
  updateCategorySelect,
  openProfileDialog,
  openMessageDialog,
  openGroupDialog,
  saveContact,
  deleteContact,
  saveGroup,
  deleteGroup,
  handleAvatarUpload,
} from "./controllers/view-controller.js"
import { sendMessage, sendWhatsAppMessage } from "./controllers/message-controller.js"
import { formatarTelefone, aplicarFormatacaoTelefone } from './controllers/validation-controller.js';
import { logAction } from "./controllers/log-controller.js"
import { showAlert, showError } from "./controllers/notification-controller.js"

// ===== STATE =====
const state = {
  contacts: [],
  groups: [{ id: "todos", name: "Todos", color: "#0078d7" }],
  filter: {
    category: "todos",
    searchTerm: "",
    sort: "name",
    view: "grid",
  },
  currentContactId: null,
  currentGroupId: null,
}

/**
 * Sets up all event listeners
 */
const setupEventListeners = () => {
  // Search functionality
  if (elementExists(elements.searchInput, "searchInput")) {
    elements.searchInput.addEventListener("input", (e) => {
      state.filter.searchTerm = e.target.value
      renderContacts(state)
    })
  }

  // View options
  elements.viewOptions.forEach((option) => {
    if (elementExists(option, "viewOption")) {
      option.addEventListener("click", () => {
        elements.viewOptions.forEach((opt) => opt.classList.remove("active"))
        option.classList.add("active")
        state.filter.view = option.dataset.view
        renderContacts(state)
      })
    }
  })

  // Dialog close buttons
  document.querySelectorAll(".dialog-close").forEach((btn) => {
    if (elementExists(btn, "dialogClose")) {
      btn.addEventListener("click", closeDialogs)
    }
  })

  // Close dialog when clicking outside
  Object.entries(elements.dialogs).forEach(([name, dialog]) => {
    if (elementExists(dialog, name)) {
      dialog.addEventListener("click", (e) => {
        if (e.target === dialog) {
          closeDialogs()
        }
      })
    }
  })

  // Button event listeners
  if (elementExists(elements.buttons.sendMessage, "sendMessageBtn")) {
    elements.buttons.sendMessage.addEventListener("click", () => sendMessage(state))
  }

  if (elementExists(elements.buttons.sendMessageWhatts, "sendMessageWhatts")) {
    elements.buttons.sendMessageWhatts.addEventListener("click", () => sendWhatsAppMessage(state))
  }

  if (elementExists(elements.buttons.profileMessage, "profileMessageBtn")) {
    elements.buttons.profileMessage.addEventListener("click", () => {
      const contactId = state.currentContactId
      closeDialogs()
      openMessageDialog(contactId, state)
    })
  }

  if (elementExists(elements.buttons.profileDelete, "profileDeleteBtn")) {
    elements.buttons.profileDelete.addEventListener("click", () => deleteContact(state))
  }

  if (elementExists(elements.buttons.profileSave, "profileSaveBtn")) {
    elements.buttons.profileSave.addEventListener("click", () => saveContact(state))
  }

  if (elementExists(elements.buttons.saveGroup, "saveGroupBtn")) {
    elements.buttons.saveGroup.addEventListener("click", () => saveGroup(state))
  }

  if (elementExists(elements.buttons.deleteGroup, "deleteGroupBtn")) {
    elements.buttons.deleteGroup.addEventListener("click", () => deleteGroup(state))
  }

  if (elementExists(elements.buttons.addContact, "addContactBtn")) {
    elements.buttons.addContact.addEventListener("click", () => openProfileDialog(null, state))
  }

  if (elementExists(elements.buttons.addGroup, "addGroupBtn")) {
    elements.buttons.addGroup.addEventListener("click", () => openGroupDialog(null, state))
  }

  if (elementExists(elements.buttons.email, "emailBtn")) {
    elements.buttons.email.addEventListener("click", () => {
      // Open message dialog for first contact in current filter
      const firstContact = state.contacts.find(
        (c) => state.filter.category === "todos" || c.category === state.filter.category,
      )
      if (firstContact) {
        openMessageDialog(firstContact.id, state)
      } else {
        showAlert("Nenhum contato encontrado nesta categoria.")
      }
    })
  }

  // Avatar upload
  if (elementExists(elements.inputs.avatar, "avatarInput")) {
    elements.inputs.avatar.addEventListener("change", handleAvatarUpload)
  }

  // Atualizar o seletor de contatos quando o diálogo de mensagem for aberto
  if (elementExists(elements.inputs.contactSelect, "contactSelect")) {
    elements.inputs.contactSelect.addEventListener("change", () => {
      const selectedId = Number.parseInt(elements.inputs.contactSelect.value)
      const contact = state.contacts.find((c) => c.id === selectedId)
      if (contact) {
        state.currentContactId = selectedId
        const messageRecipient = document.getElementById("messageRecipient")
        if (elementExists(messageRecipient, "messageRecipient")) {
          messageRecipient.textContent = `Para: ${contact.name} (${contact.phone})`
        }
      }
    })
  }
}

/**
 * Inicializa a aplicação
 */
const init = async () => {
  console.log("Inicializando aplicação...")

  // Registrar log de inicialização
  logAction('init', { message: 'Aplicação inicializada' });

  // Verificar se os elementos essenciais existem
  if (!elementExists(elements.contactsGrid, "contactsGrid") || !elementExists(elements.contactsList, "contactsList")) {
    console.error("Elementos essenciais não encontrados. Verifique o HTML.")
    showError("Erro ao inicializar a aplicação. Elementos essenciais não encontrados.")
    return
  }

  // Verificar conexão com a API
  const apiConnected = await checkApiConnection()
  if (!apiConnected) {
    elements.contactsGrid.innerHTML =
      '<div class="no-contacts">Erro de conexão com o servidor. Verifique se o servidor está rodando.</div>'
    return
  }

  // Buscar contatos da API
  await fetchContacts(state)

  // Atualizar abas de navegação
  updateNavTabs(state)

  // Atualizar seletor de categorias
  updateCategorySelect(state)

  // Configurar event listeners
  setupEventListeners()

  console.log("Aplicação inicializada com sucesso!")
}

document.addEventListener('DOMContentLoaded', () => {
  aplicarFormatacaoTelefone();
});

const sortSelect = document.getElementById('sortSelect');
if (sortSelect) {
  sortSelect.addEventListener('change', () => {
    state.filter.sort = sortSelect.value;
    renderContacts(state);
  });
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", init)