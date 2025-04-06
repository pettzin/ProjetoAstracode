// View Controller
// Responsável por funções de visualização, grupos e filtros

import { elements, elementExists, closeDialogs } from "./dom-controller.js"
import { updateContact, deleteContactAPI, createContact } from "./api-controller.js"
import { imageToBase64 } from "./utils.js"

/**
 * Updates the category select options in the profile dialog
 */
export const updateCategorySelect = (state) => {
  if (!elementExists(elements.inputs.profileCategory, "profileCategory")) return

  elements.inputs.profileCategory.innerHTML = ""
  state.groups.forEach((group) => {
    if (group.id !== "todos") {
      const option = document.createElement("option")
      option.value = group.id
      option.textContent = group.name
      elements.inputs.profileCategory.appendChild(option)
    }
  })
}

/**
 * Atualiza o seletor de contatos no diálogo de mensagem
 */
export const updateContactSelect = (state) => {
  if (!elementExists(elements.inputs.contactSelect, "contactSelect")) return

  elements.inputs.contactSelect.innerHTML = ""

  if (state.contacts.length === 0) {
    const option = document.createElement("option")
    option.value = ""
    option.textContent = "Nenhum contato disponível"
    elements.inputs.contactSelect.appendChild(option)
    return
  }

  state.contacts.forEach((contact) => {
    const option = document.createElement("option")
    option.value = contact.id
    option.textContent = `${contact.name} (${contact.phone})`
    elements.inputs.contactSelect.appendChild(option)
  })
}

/**
 * Sorts contacts based on current sort setting
 * @param {Array} contacts - The contacts to sort
 * @returns {Array} - Sorted contacts
 */
export const sortContacts = (contacts, sortType) => {
  const sortedContacts = [...contacts]

  switch (sortType) {
    case "name":
      sortedContacts.sort((a, b) => a.name.localeCompare(b.name))
      break
    case "name-desc":
      sortedContacts.sort((a, b) => b.name.localeCompare(a.name))
      break
    case "recent":
      sortedContacts.sort((a, b) => b.date - a.date)
      break
    default:
      sortedContacts.sort((a, b) => a.name.localeCompare(b.name))
  }

  return sortedContacts
}

/**
 * Renders contacts based on current filter, search, and sort settings
 */
export const renderContacts = (state) => {
  if (!elementExists(elements.contactsGrid, "contactsGrid") || !elementExists(elements.contactsList, "contactsList")) {
    return
  }

  // Verificar se há contatos
  if (!state.contacts || state.contacts.length === 0) {
    elements.contactsGrid.innerHTML =
      '<div class="no-contacts">Nenhum contato encontrado. Adicione um novo contato.</div>'
    elements.contactsList.innerHTML = ""
    return
  }

  // Filter contacts based on category and search term
  const filteredContacts = state.contacts.filter((contact) => {
    const matchesCategory = state.filter.category === "todos" || contact.category === state.filter.category
    const matchesSearch =
      state.filter.searchTerm === "" ||
      (contact.name && contact.name.toLowerCase().includes(state.filter.searchTerm.toLowerCase())) ||
      (contact.phone && contact.phone.includes(state.filter.searchTerm))
    return matchesCategory && matchesSearch
  })

  // Verificar se há contatos filtrados
  if (filteredContacts.length === 0) {
    const message = state.filter.searchTerm
      ? `Nenhum contato encontrado para "${state.filter.searchTerm}".`
      : "Nenhum contato encontrado nesta categoria."

    elements.contactsGrid.innerHTML = `<div class="no-contacts">${message}</div>`
    elements.contactsList.innerHTML = ""
    return
  }

  // Sort contacts
  const sortedContacts = sortContacts(filteredContacts, state.filter.sort);

  // Clear both containers
  elements.contactsGrid.innerHTML = ""
  elements.contactsList.innerHTML = ""

  // Generate contacts based on current view
  if (state.filter.view === "grid") {
    elements.contactsGrid.style.display = "grid"
    elements.contactsList.style.display = "none"

    sortedContacts.forEach((contact) => {
      const contactCard = document.createElement("div")
      contactCard.className = "contact-card"
      contactCard.dataset.id = contact.id
      contactCard.innerHTML = `
                <img src="${contact.avatar}" alt="${contact.name}" class="contact-avatar">
                <div class="contact-name">${contact.name} ${contact.sobrenome || ""}</div>
                <div class="contact-phone">${contact.phone}</div>
            `
      elements.contactsGrid.appendChild(contactCard)

      // Add click event to open profile dialog
      contactCard.addEventListener("click", () => {
        openProfileDialog(contact.id, state)
      })
    })
  } else {
    elements.contactsGrid.style.display = "none"
    elements.contactsList.style.display = "flex"

    sortedContacts.forEach((contact) => {
      const contactRow = document.createElement("div")
      contactRow.className = "contact-row"
      contactRow.dataset.id = contact.id
      contactRow.innerHTML = `
                <img src="${contact.avatar}" alt="${contact.name}" class="contact-avatar">
                <div class="contact-info">
                    <div class="contact-name">${contact.name} ${contact.sobrenome || ""}</div>
                    <div class="contact-email">${contact.email}</div>
                </div>
                <div class="contact-phone">${contact.phone}</div>
            `
      elements.contactsList.appendChild(contactRow)

      // Add click event to open profile dialog
      contactRow.addEventListener("click", () => {
        openProfileDialog(contact.id, state)
      })
    })
  }
}

/**
 * Updates navigation tabs based on current groups
 */
export const updateNavTabs = (state) => {
  if (!elementExists(elements.navTabs, "navTabs")) return

  elements.navTabs.innerHTML = ""

  state.groups.forEach((group) => {
    const tabElement = document.createElement("div")
    tabElement.className = "nav-tab"
    if (state.filter.category === group.id) {
      tabElement.classList.add("active")
    }
    tabElement.dataset.category = group.id

    if (group.id === "todos") {
      tabElement.textContent = "Todos"
    } else {
      tabElement.innerHTML = `
                <div class="nav-tab-content">${group.name}</div>
                <div class="edit-group-btn" data-group="${group.id}">⚙️</div>
            `

      // Add event listener to edit group button
      setTimeout(() => {
        const editBtn = tabElement.querySelector(".edit-group-btn")
        if (editBtn) {
          editBtn.addEventListener("click", (e) => {
            e.stopPropagation()
            openGroupDialog(group.id, state)
          })
        }
      }, 0)
    }

    // Add event listener to tab
    tabElement.addEventListener("click", () => {
      document.querySelectorAll(".nav-tab").forEach((t) => t.classList.remove("active"))
      tabElement.classList.add("active")
      state.filter.category = group.id
      renderContacts(state)
    })

    elements.navTabs.appendChild(tabElement)
  })
}

/**
 * Opens the message dialog for a specific contact
 * @param {number} contactId - The ID of the contact
 */
export const openMessageDialog = (contactId, state) => {
  // Verificar se o diálogo existe
  if (!elementExists(elements.dialogs.message, "messageDialog")) return

  // Atualizar o seletor de contatos
  updateContactSelect(state)

  const contact = state.contacts.find((c) => c.id === contactId)
  if (contact) {
    state.currentContactId = contactId

    // Selecionar o contato no seletor
    if (elementExists(elements.inputs.contactSelect, "contactSelect")) {
      elements.inputs.contactSelect.value = contactId
    }

    // Atualizar o destinatário
    const messageRecipient = document.getElementById("messageRecipient")
    if (elementExists(messageRecipient, "messageRecipient")) {
      messageRecipient.textContent = `Para: ${contact.name} (${contact.phone})`
    }

    // Limpar a mensagem
    const messageText = document.getElementById("messageText")
    if (elementExists(messageText, "messageText")) {
      messageText.value = ""
    }

    // Definir data e hora padrão
    setDefaultDateTime()

    // Exibir o diálogo
    elements.dialogs.message.style.display = "flex"
  } else {
    alert("Contato não encontrado.")
  }
}

/**
 * Opens the profile dialog for creating or editing a contact
 * @param {number|null} contactId - The ID of the contact to edit, or null for a new contact
 */
export const openProfileDialog = (contactId, state) => {
  // Verificar se o diálogo existe
  if (!elementExists(elements.dialogs.profile, "profileDialog")) return

  updateCategorySelect(state)

  let contact

  if (contactId) {
    contact = state.contacts.find((c) => c.id === contactId)
    if (!contact) {
      alert("Contato não encontrado.")
      return
    }
    state.currentContactId = contactId
  } else {
    // New contact
    contact = {
      id: null,
      name: "",
      sobrenome: "",
      phone: "",
      email: "",
      avatar: "../img/iconContact.png",
      category: state.filter.category === "todos" ? "todos" : state.filter.category,
      date: new Date(),
    }
    state.currentContactId = null
  }

  // Preencher os campos do formulário
  const profileName = document.getElementById("profileName")
  const profilePhone = document.getElementById("profilePhone")
  const profileEmail = document.getElementById("profileEmail")
  const profileCategory = document.getElementById("profileCategory")
  const profileAvatar = document.getElementById("profileAvatar")
  const profileSobrenome = document.getElementById("profileSobrenome")

  if (elementExists(profileName, "profileName")) profileName.value = contact.name
  if (elementExists(profilePhone, "profilePhone")) profilePhone.value = contact.phone
  if (elementExists(profileEmail, "profileEmail")) profileEmail.value = contact.email
  if (elementExists(profileCategory, "profileCategory")) profileCategory.value = contact.category
  if (elementExists(profileAvatar, "profileAvatar")) profileAvatar.src = contact.avatar
  if (elementExists(profileSobrenome, "profileSobrenome")) profileSobrenome.value = contact.sobrenome || ""

  // Exibir o diálogo
  elements.dialogs.profile.style.display = "flex"
}

/**
 * Opens the group dialog for creating or editing a group
 * @param {string|null} groupId - The ID of the group to edit, or null for a new group
 */
export const openGroupDialog = (groupId = null, state) => {
  // Verificar se o diálogo existe
  if (!elementExists(elements.dialogs.group, "groupDialog")) return

  const groupDialogTitle = document.getElementById("groupDialogTitle")
  const groupName = document.getElementById("groupName")
  const groupMembersList = document.getElementById("groupMembersList")
  const deleteGroupBtn = document.getElementById("deleteGroupBtn")

  // Verificar se os elementos existem
  if (
    !elementExists(groupDialogTitle, "groupDialogTitle") ||
    !elementExists(groupName, "groupName") ||
    !elementExists(groupMembersList, "groupMembersList") ||
    !elementExists(deleteGroupBtn, "deleteGroupBtn")
  ) {
    return
  }

  if (groupId) {
    // Edit existing group
    state.currentGroupId = groupId
    const group = state.groups.find((g) => g.id === groupId)

    if (group) {
      groupDialogTitle.textContent = "Editar Grupo"
      groupName.value = group.name
      deleteGroupBtn.style.display = "block"
    } else {
      alert("Grupo não encontrado.")
      return
    }
  } else {
    // New group
    state.currentGroupId = null
    groupDialogTitle.textContent = "Novo Grupo"
    groupName.value = ""
    deleteGroupBtn.style.display = "none"
  }

  // Generate member list
  groupMembersList.innerHTML = ""

  if (state.contacts.length === 0) {
    groupMembersList.innerHTML = '<div class="no-members">Nenhum contato disponível.</div>'
  } else {
    state.contacts.forEach((contact) => {
      const memberItem = document.createElement("div")
      memberItem.className = "member-item"

      const isInGroup = contact.category === (state.currentGroupId || "")

      memberItem.innerHTML = `
              <input type="checkbox" class="member-checkbox" data-id="${contact.id}" ${isInGroup ? "checked" : ""}>
              <div class="member-name">${contact.name}</div>
          `

      groupMembersList.appendChild(memberItem)
    })
  }

  // Exibir o diálogo
  elements.dialogs.group.style.display = "flex"
}

/**
 * Saves the current contact (creates or updates)
 */
export const saveContact = async (state) => {
  const profileName = document.getElementById("profileName")
  const profilePhone = document.getElementById("profilePhone")
  const profileEmail = document.getElementById("profileEmail")
  const profileCategory = document.getElementById("profileCategory")
  const profileAvatar = document.getElementById("profileAvatar")
  const profileSobrenome = document.getElementById("profileSobrenome")

  // Verificar se os elementos existem
  if (
    !elementExists(profileName, "profileName") ||
    !elementExists(profilePhone, "profilePhone") ||
    !elementExists(profileCategory, "profileCategory")
  ) {
    return
  }

  const name = profileName.value.trim()
  const phone = profilePhone.value.trim()
  const email = profileEmail ? profileEmail.value.trim() : ""
  const category = profileCategory.value
  const avatar = profileAvatar ? profileAvatar.src : "../img/iconContact.png"
  const sobrenome = profileSobrenome ? profileSobrenome.value.trim() : ""

  if (!name || !phone) {
    alert("Por favor, preencha pelo menos o nome e o telefone.")
    return
  }

  const contact = {
    id: state.currentContactId,
    name,
    sobrenome,
    phone,
    email,
    category,
    avatar,
    date: new Date(),
  }

  let success = false

  if (state.currentContactId) {
    // Update existing contact
    success = await updateContact(contact, state)
  } else {
    // Add new contact
    success = await createContact(contact, state)
  }

  if (success) {
    closeDialogs()
  }
}

/**
 * Saves the current group (creates or updates)
 */
export const saveGroup = async (state) => {
  const groupName = document.getElementById("groupName")

  // Verificar se o elemento existe
  if (!elementExists(groupName, "groupName")) return

  const name = groupName.value.trim()

  if (!name) {
    alert("Por favor, digite um nome para o grupo.")
    return
  }

  if (state.currentGroupId) {
    // Update existing group
    const index = state.groups.findIndex((g) => g.id === state.currentGroupId)
    if (index !== -1) {
      state.groups[index].name = name
    }
  } else {
    // Create new group
    const groupId = name.toLowerCase().replace(/\s+/g, "-")

    // Check if group ID already exists
    if (state.groups.some((g) => g.id === groupId)) {
      alert("Já existe um grupo com este nome. Por favor, escolha outro nome.")
      return
    }

    // Add new group
    state.groups.push({
      id: groupId,
      name: name,
      color: "#0078d7",
    })

    state.currentGroupId = groupId
  }

  // Update member assignments
  const memberCheckboxes = document.querySelectorAll(".member-checkbox")
  const updatePromises = []

  memberCheckboxes.forEach((checkbox) => {
    const contactId = Number.parseInt(checkbox.dataset.id)
    const contact = state.contacts.find((c) => c.id === contactId)

    if (contact) {
      const shouldBeInGroup = checkbox.checked
      const isInGroup = contact.category === state.currentGroupId

      if (shouldBeInGroup !== isInGroup) {
        const updatedContact = {
          ...contact,
          category: shouldBeInGroup ? state.currentGroupId : "todos",
        }

        updatePromises.push(updateContact(updatedContact, state))
      }
    }
  })

  if (updatePromises.length > 0) {
    try {
      await Promise.all(updatePromises)
    } catch (error) {
      console.error("Erro ao atualizar membros do grupo:", error)
    }
  }

  closeDialogs()
  updateNavTabs(state)
  renderContacts(state)
}

/**
 * Deletes the current group
 */
export const deleteGroup = async (state) => {
  if (!state.currentGroupId) return

  if (
    confirm(
      `Tem certeza que deseja excluir o grupo "${state.groups.find((g) => g.id === state.currentGroupId)?.name}"?`,
    )
  ) {
    // Move contacts to "outros" category
    const updatePromises = []

    state.contacts.forEach((contact) => {
      if (contact.category === state.currentGroupId) {
        const updatedContact = {
          ...contact,
          category: "todos",
        }

        updatePromises.push(updateContact(updatedContact, state))
      }
    })

    if (updatePromises.length > 0) {
      try {
        await Promise.all(updatePromises)
      } catch (error) {
        console.error("Erro ao atualizar contatos do grupo:", error)
      }
    }

    // Remove group
    state.groups = state.groups.filter((g) => g.id !== state.currentGroupId)

    // Update current filter if needed
    if (state.filter.category === state.currentGroupId) {
      state.filter.category = "todos"
    }

    closeDialogs()
    updateNavTabs(state)
    renderContacts(state)
  }
}

/**
 * Deletes the current contact
 */
export const deleteContact = async (state) => {
  if (state.currentContactId && confirm("Tem certeza que deseja excluir este contato?")) {
    const success = await deleteContactAPI(state.currentContactId, state)

    if (success) {
      closeDialogs()
    }
  }
}

/**
 * Handles avatar upload
 */
export const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (file) {
    try {
      // Convert image to base64
      const base64Image = await imageToBase64(file)
      const profileAvatar = document.getElementById("profileAvatar")
      if (elementExists(profileAvatar, "profileAvatar")) {
        profileAvatar.src = base64Image
      }
    } catch (error) {
      console.error("Erro ao converter imagem:", error)
      alert("Não foi possível processar a imagem. Tente novamente.")
    }
  }
}

const setDefaultDateTime = () => {
  // Implementation for setDefaultDateTime
}


