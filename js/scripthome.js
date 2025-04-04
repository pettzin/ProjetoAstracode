// Configuração da API
const API = {
  BASE_URL: "http://localhost:3000",
  ENDPOINTS: {
    SELECT: "/api/contatos",
    INSERT: "/api/insert",
    UPDATE: (id) => `/api/update/${id}`,
    DELETE: (id) => `/api/delete/${id}`,
  },
}

const DEFAULT_AVATAR = "../img/iconContact.png"

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

// ===== DOM ELEMENTS =====
const elements = {
  contactsGrid: document.getElementById("contactsGrid"),
  contactsList: document.getElementById("contactsList"),
  searchInput: document.getElementById("searchInput"),
  sortButton: document.getElementById("sortButton"), // Corrigido: Alterado de sortSelect para sortButton
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
    sendMessageWhatts: document.getElementById("sendMessagewhatts"), // Adicionado: Botão de WhatsApp
    profileMessage: document.getElementById("profileMessageBtn"),
    profileDelete: document.getElementById("profileDeleteBtn"),
    profileSave: document.getElementById("profileSaveBtn"),
    saveGroup: document.getElementById("saveGroupBtn"),
    deleteGroup: document.getElementById("deleteGroupBtn"),
  },
  inputs: {
    avatar: document.getElementById("avatarInput"),
    profileCategory: document.getElementById("profileCategory"),
    contactSelect: document.getElementById("contactSelect"), // Adicionado: Seletor de contatos
  },
  loading: document.getElementById("loadingSpinner"),
  navTabs: document.getElementById("navTabs"),
}

// ===== UTILITY FUNCTIONS =====

/**
 * Verifica se um elemento existe no DOM
 * @param {HTMLElement} element - O elemento a ser verificado
 * @param {string} name - Nome do elemento para log
 * @returns {boolean} - Se o elemento existe
 */
const elementExists = (element, name) => {
  if (!element) {
    console.error(`Elemento ${name} não encontrado no DOM`)
    return false
  }
  return true
}

/**
 * Verifica a conexão com a API
 * @returns {Promise<boolean>} - Se a conexão foi bem-sucedida
 */
const checkApiConnection = async () => {
  try {
    const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.SELECT}`)
    if (!response.ok) {
      throw new Error(`Erro de conexão: ${response.status}`)
    }
    console.log("Conexão com a API estabelecida com sucesso!")
    return true
  } catch (error) {
    console.error("Erro ao conectar com a API:", error)
    alert("Não foi possível conectar ao servidor. Verifique se o servidor está rodando e tente novamente.")
    return false
  }
}

/**
 * Shows the loading spinner
 */
const showLoading = () => {
  if (elementExists(elements.loading, "loading")) {
    elements.loading.style.display = "flex"
  }
}

/**
 * Hides the loading spinner
 */
const hideLoading = () => {
  if (elementExists(elements.loading, "loading")) {
    elements.loading.style.display = "none"
  }
}

/**
 * Converts an image file to base64
 * @param {File} file - The image file to convert
 * @returns {Promise<string>} - Promise resolving to base64 string
 */
const imageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

/**
 * Formats a date to YYYY-MM-DD
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Formats a time to HH:MM
 * @param {Date} date - The date to extract time from
 * @returns {string} - Formatted time string
 */
const formatTime = (date) => {
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${hours}:${minutes}`
}

/**
 * Sets the default date and time for message scheduling
 */
const setDefaultDateTime = () => {
  const now = new Date()
  const dateInput = document.getElementById("messageDate")
  const timeInput = document.getElementById("messageTime")

  if (elementExists(dateInput, "messageDate") && elementExists(timeInput, "messageTime")) {
    dateInput.value = formatDate(now)
    timeInput.value = formatTime(now)
  }
}

/**
 * Closes all dialogs
 */
const closeDialogs = () => {
  Object.entries(elements.dialogs).forEach(([name, dialog]) => {
    if (elementExists(dialog, name)) {
      dialog.style.display = "none"
    }
  })
}

// ===== API FUNCTIONS =====

/**
 * Fetches all contacts from the API
 */
const fetchContacts = async () => {
  showLoading()
  try {
    const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.SELECT}`)
    if (!response.ok) {
      throw new Error("Erro ao buscar contatos")
    }
    const data = await response.json()

    // Transform API data to our format
    state.contacts = data.map((contact) => ({
      id: contact.id,
      name: contact.nome || "",
      sobrenome: contact.sobrenome || "", // Adicionado campo de sobrenome
      phone: contact.telefone || "",
      email: contact.email || "",
      avatar: contact.imagem || DEFAULT_AVATAR,
      category: contact.grupo || "todos",
      date: new Date(contact.data_criacao || Date.now()),
    }))

    renderContacts()

    // Atualizar o seletor de contatos no diálogo de mensagem
    updateContactSelect()
  } catch (error) {
    console.error("Erro ao buscar contatos:", error)
    alert("Não foi possível carregar os contatos. Verifique a conexão com o servidor.")

    // Exibir mensagem no grid de contatos
    if (elementExists(elements.contactsGrid, "contactsGrid")) {
      elements.contactsGrid.innerHTML =
        '<div class="no-contacts">Erro ao carregar contatos. Tente novamente mais tarde.</div>'
    }
  } finally {
    hideLoading()
  }
}

/**
 * Atualiza o seletor de contatos no diálogo de mensagem
 */
const updateContactSelect = () => {
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

  // Adicionar evento de mudança
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

/**
 * Creates a new contact via API
 * @param {Object} contact - The contact to create
 * @returns {Promise<boolean>} - Success status
 */
const createContact = async (contact) => {
  showLoading()
  try {
    // Verificar se nome e telefone estão presentes (email não é mais obrigatório)
    if (!contact.name || !contact.phone) {
      throw new Error("Os campos nome e telefone são obrigatórios.")
    }

    // Create the request body without requiring email
    const requestBody = {
      nome: contact.name,
      sobrenome: contact.sobrenome || "",
      email: contact.email || "", // Email agora é opcional
      telefone: contact.phone,
      grupo: contact.category || "todos",
      // 'imagem' field is removed since it doesn't exist in the database
    }

    console.log("Enviando dados:", requestBody) // Log para debug

    const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.INSERT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Resposta do servidor:", errorText)
      throw new Error("Erro ao criar contato")
    }

    await fetchContacts()
    return true
  } catch (error) {
    console.error("Erro ao criar contato:", error)
    alert("Não foi possível criar o contato. Verifique a conexão com o servidor.")
    return false
  } finally {
    hideLoading()
  }
}

/**
 * Updates an existing contact via API
 * @param {Object} contact - The contact to update
 * @returns {Promise<boolean>} - Success status
 */
const updateContact = async (contact) => {
  showLoading()
  try {
    // Create the request body without the image field to avoid the database error
    const requestBody = {
      nome: contact.name,
      sobrenome: contact.sobrenome,
      email: contact.email || "", // Email agora é opcional
      telefone: contact.phone,
      grupo: contact.category,
      imagem: contact.avatar,
    }

    const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.UPDATE(contact.id)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error("Erro ao atualizar contato")
    }

    await fetchContacts()
    return true
  } catch (error) {
    console.error("Erro ao atualizar contato:", error)
    alert("Não foi possível atualizar o contato. Verifique a conexão com o servidor.")
    return false
  } finally {
    hideLoading()
  }
}

/**
 * Deletes a contact via API
 * @param {number} contactId - The ID of the contact to delete
 * @returns {Promise<boolean>} - Success status
 */
const deleteContactAPI = async (contactId) => {
  showLoading()
  try {
    const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.DELETE(contactId)}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Erro ao excluir contato")
    }

    await fetchContacts()
    return true
  } catch (error) {
    console.error("Erro ao excluir contato:", error)
    alert("Não foi possível excluir o contato. Verifique a conexão com o servidor.")
    return false
  } finally {
    hideLoading()
  }
}

// ===== RENDERING FUNCTIONS =====

/**
 * Updates the category select options in the profile dialog
 */
const updateCategorySelect = () => {
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
 * Sorts contacts based on current sort setting
 * @param {Array} contacts - The contacts to sort
 * @returns {Array} - Sorted contacts
 */
const sortContacts = (contacts) => {
  const sortedContacts = [...contacts]

  switch (state.filter.sort) {
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
const renderContacts = () => {
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
  const sortedContacts = sortContacts(filteredContacts)

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
        openProfileDialog(contact.id)
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
        openProfileDialog(contact.id)
      })
    })
  }
}

/**
 * Updates navigation tabs based on current groups
 */
const updateNavTabs = () => {
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
            openGroupDialog(group.id)
          })
        }
      }, 0)
    }

    // Add event listener to tab
    tabElement.addEventListener("click", () => {
      document.querySelectorAll(".nav-tab").forEach((t) => t.classList.remove("active"))
      tabElement.classList.add("active")
      state.filter.category = group.id
      renderContacts()
    })

    elements.navTabs.appendChild(tabElement)
  })
}

// ===== DIALOG FUNCTIONS =====

/**
 * Opens the message dialog for a specific contact
 * @param {number} contactId - The ID of the contact
 */
const openMessageDialog = (contactId) => {
  // Verificar se o diálogo existe
  if (!elementExists(elements.dialogs.message, "messageDialog")) return

  // Atualizar o seletor de contatos
  updateContactSelect()

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
const openProfileDialog = (contactId) => {
  // Verificar se o diálogo existe
  if (!elementExists(elements.dialogs.profile, "profileDialog")) return

  updateCategorySelect()

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
      sobrenome: "", // Adicionado campo de sobrenome
      phone: "",
      email: "",
      avatar: DEFAULT_AVATAR,
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
const openGroupDialog = (groupId = null) => {
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

// ===== ACTION FUNCTIONS =====

/**
 * Saves the current contact (creates or updates)
 */
const saveContact = async () => {
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
  const avatar = profileAvatar ? profileAvatar.src : DEFAULT_AVATAR
  const sobrenome = profileSobrenome ? profileSobrenome.value.trim() : ""

  if (!name || !phone) {
    alert("Por favor, preencha pelo menos o nome e o telefone.")
    return
  }

  const contact = {
    id: state.currentContactId,
    name,
    sobrenome, // Adicionado campo de sobrenome
    phone,
    email,
    category,
    avatar,
    date: new Date(),
  }

  let success = false

  if (state.currentContactId) {
    // Update existing contact
    success = await updateContact(contact)
  } else {
    // Add new contact
    success = await createContact(contact)
  }

  if (success) {
    closeDialogs()
  }
}

/**
 * Saves the current group (creates or updates)
 */
const saveGroup = async () => {
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

        updatePromises.push(updateContact(updatedContact))
      }
    }
  })

  if (updatePromises.length > 0) {
    showLoading()
    try {
      await Promise.all(updatePromises)
    } finally {
      hideLoading()
    }
  }

  closeDialogs()
  updateNavTabs()
  renderContacts()
}

/**
 * Deletes the current group
 */
const deleteGroup = async () => {
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

        updatePromises.push(updateContact(updatedContact))
      }
    })

    if (updatePromises.length > 0) {
      showLoading()
      try {
        await Promise.all(updatePromises)
      } finally {
        hideLoading()
      }
    }

    // Remove group
    state.groups = state.groups.filter((g) => g.id !== state.currentGroupId)

    // Update current filter if needed
    if (state.filter.category === state.currentGroupId) {
      state.filter.category = "todos"
    }

    closeDialogs()
    updateNavTabs()
    renderContacts()
  }
}

/**
 * Deletes the current contact
 */
const deleteContact = async () => {
  if (state.currentContactId && confirm("Tem certeza que deseja excluir este contato?")) {
    const success = await deleteContactAPI(state.currentContactId)

    if (success) {
      closeDialogs()
    }
  }
}

/**
 * Agenda uma mensagem para ser enviada em um horário específico
 */
const sendMessage = () => {
  const contactSelect = document.getElementById("contactSelect")
  const messageText = document.getElementById("messageText")
  const messageDate = document.getElementById("messageDate")
  const messageTime = document.getElementById("messageTime")

  if (!contactSelect || !messageText || !messageDate || !messageTime) return

  const selectedContactId = Number.parseInt(contactSelect.value)
  const text = messageText.value.trim()
  const date = messageDate.value
  const time = messageTime.value

  if (!selectedContactId) {
    alert("Por favor, selecione um contato.")
    return
  }

  if (!text) {
    alert("Por favor, escreva uma mensagem.")
    return
  }

  if (!date || !time) {
    alert("Selecione uma data e hora para agendamento.")
    return
  }

  const contact = state.contacts.find((c) => c.id === selectedContactId)
  if (contact) {
    const scheduledDateTime = new Date(`${date}T${time}`)

    // Verificar se a data é válida
    if (isNaN(scheduledDateTime.getTime())) {
      alert("Data ou hora inválida. Por favor, verifique o formato.")
      return
    }

    // Verificar se a data não é no passado
    if (scheduledDateTime < new Date()) {
      alert("Não é possível agendar mensagens para o passado. Por favor, selecione uma data e hora futura.")
      return
    }

    // Criar objeto de agendamento
    const scheduledMessage = {
      id: Date.now(), // ID único baseado no timestamp atual
      contactId: selectedContactId,
      contactName: contact.name,
      contactPhone: contact.phone,
      message: text,
      scheduledTime: scheduledDateTime.getTime(),
    }

    // Armazenar o agendamento no localStorage
    saveScheduledMessage(scheduledMessage)

    // Configurar o temporizador para exibir o alerta no momento agendado
    scheduleMessageAlert(scheduledMessage)

    alert(`Mensagem agendada para ${contact.name} às ${scheduledDateTime.toLocaleString()}: ${text}`)
    closeDialogs()
  }
}

/**
 * Salva uma mensagem agendada no localStorage
 * @param {Object} scheduledMessage - A mensagem agendada
 */
const saveScheduledMessage = (scheduledMessage) => {
  // Obter mensagens agendadas existentes
  const scheduledMessages = JSON.parse(localStorage.getItem("scheduledMessages") || "[]")

  // Adicionar nova mensagem
  scheduledMessages.push(scheduledMessage)

  // Salvar de volta no localStorage
  localStorage.setItem("scheduledMessages", JSON.stringify(scheduledMessages))

  console.log("Mensagem agendada salva:", scheduledMessage)
}

/**
 * Configura um temporizador para exibir o alerta no momento agendado
 * @param {Object} scheduledMessage - A mensagem agendada
 */
const scheduleMessageAlert = (scheduledMessage) => {
  const now = new Date().getTime()
  const delay = scheduledMessage.scheduledTime - now

  // Se o tempo já passou, não agendar
  if (delay <= 0) return

  console.log(`Agendando alerta para mensagem ID ${scheduledMessage.id} em ${Math.floor(delay / 1000)} segundos`)

  // Configurar o temporizador
  setTimeout(() => {
    const contact = state.contacts.find((c) => c.id === scheduledMessage.contactId)

    if (contact) {
      const phoneNumber = contact.phone.replace(/\D/g, "")
      const encodedMessage = encodeURIComponent(scheduledMessage.message)
      const whatsappLink = `https://wa.me/${phoneNumber}/?text=${encodedMessage}`

      // Exibir alerta com opção para enviar a mensagem
      if (
        confirm(
          `Hora de enviar a mensagem agendada para ${contact.name}:\n\n${scheduledMessage.message}\n\nClique em OK para abrir o WhatsApp e enviar a mensagem.`,
        )
      ) {
        window.open(whatsappLink, "target = _blank")
      }

      // Remover a mensagem da lista de agendamentos
      removeScheduledMessage(scheduledMessage.id)
    }
  }, delay)
}

/**
 * Remove uma mensagem agendada do localStorage
 * @param {number} messageId - O ID da mensagem a ser removida
 */
const removeScheduledMessage = (messageId) => {
  // Obter mensagens agendadas existentes
  const scheduledMessages = JSON.parse(localStorage.getItem("scheduledMessages") || "[]")

  // Filtrar a mensagem a ser removida
  const updatedMessages = scheduledMessages.filter((msg) => msg.id !== messageId)

  // Salvar de volta no localStorage
  localStorage.setItem("scheduledMessages", JSON.stringify(updatedMessages))

  console.log("Mensagem agendada removida:", messageId)
}

/**
 * Envia mensagem via WhatsApp
 */
const sendWhatsAppMessage = () => {
  const messageText = document.getElementById("messageText")

  // Verificar se o elemento existe
  if (!elementExists(messageText, "messageText")) return

  const text = messageText.value.trim()

  if (!text) {
    alert("Por favor, escreva uma mensagem.")
    return
  }

  const contact = state.contacts.find((c) => c.id === state.currentContactId)
  if (contact && contact.phone) {
    // Remover caracteres não numéricos do telefone
    const phoneNumber = contact.phone.replace(/\D/g, "")

    if (!phoneNumber) {
      alert("Número de telefone inválido.")
      return
    }

    const encodedMessage = encodeURIComponent(text)
    const whatsappLink = `https://wa.me/${phoneNumber}/?text=${encodedMessage}`

    window.open(whatsappLink, "_blank")
    closeDialogs()
  } else {
    alert("Contato não encontrado ou sem número de telefone.")
  }
}

/**
 * Handles avatar upload
 */
const handleAvatarUpload = async (event) => {
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

// ===== EVENT LISTENERS =====

/**
 * Sets up all event listeners
 */
const setupEventListeners = () => {
  // Search functionality
  if (elementExists(elements.searchInput, "searchInput")) {
    elements.searchInput.addEventListener("input", (e) => {
      state.filter.searchTerm = e.target.value
      renderContacts()
    })
  }

  // Sort functionality
  if (elementExists(elements.sortButton, "sortButton")) {
    elements.sortButton.addEventListener("click", () => {
      // Alternar entre opções de ordenação
      state.filter.sort = state.filter.sort === "name" ? "name-desc" : "name"
      renderContacts()
    })
  }

  // View options
  elements.viewOptions.forEach((option) => {
    if (elementExists(option, "viewOption")) {
      option.addEventListener("click", () => {
        elements.viewOptions.forEach((opt) => opt.classList.remove("active"))
        option.classList.add("active")
        state.filter.view = option.dataset.view
        renderContacts()
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
    elements.buttons.sendMessage.addEventListener("click", sendMessage)
  }

  if (elementExists(elements.buttons.sendMessageWhatts, "sendMessageWhatts")) {
    elements.buttons.sendMessageWhatts.addEventListener("click", sendWhatsAppMessage)
  }

  if (elementExists(elements.buttons.profileMessage, "profileMessageBtn")) {
    elements.buttons.profileMessage.addEventListener("click", () => {
      const contactId = state.currentContactId
      closeDialogs()
      openMessageDialog(contactId)
    })
  }

  if (elementExists(elements.buttons.profileDelete, "profileDeleteBtn")) {
    elements.buttons.profileDelete.addEventListener("click", deleteContact)
  }

  if (elementExists(elements.buttons.profileSave, "profileSaveBtn")) {
    elements.buttons.profileSave.addEventListener("click", saveContact)
  }

  if (elementExists(elements.buttons.saveGroup, "saveGroupBtn")) {
    elements.buttons.saveGroup.addEventListener("click", saveGroup)
  }

  if (elementExists(elements.buttons.deleteGroup, "deleteGroupBtn")) {
    elements.buttons.deleteGroup.addEventListener("click", deleteGroup)
  }

  if (elementExists(elements.buttons.addContact, "addContactBtn")) {
    elements.buttons.addContact.addEventListener("click", () => openProfileDialog())
  }

  if (elementExists(elements.buttons.addGroup, "addGroupBtn")) {
    elements.buttons.addGroup.addEventListener("click", () => openGroupDialog())
  }

  if (elementExists(elements.buttons.email, "emailBtn")) {
    elements.buttons.email.addEventListener("click", () => {
      // Open message dialog for first contact in current filter
      const firstContact = state.contacts.find(
        (c) => state.filter.category === "todos" || c.category === state.filter.category,
      )
      if (firstContact) {
        openMessageDialog(firstContact.id)
      } else {
        alert("Nenhum contato encontrado nesta categoria.")
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

// ===== INITIALIZATION =====

/**
 * Inicializa a aplicação
 */
const init = async () => {
  console.log("Inicializando aplicação...")

  // Verificar se os elementos essenciais existem
  if (!elementExists(elements.contactsGrid, "contactsGrid") || !elementExists(elements.contactsList, "contactsList")) {
    console.error("Elementos essenciais não encontrados. Verifique o HTML.")
    alert("Erro ao inicializar a aplicação. Elementos essenciais não encontrados.")
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
  await fetchContacts()

  // Atualizar abas de navegação
  updateNavTabs()

  // Atualizar seletor de categorias
  updateCategorySelect()

  // Configurar event listeners
  setupEventListeners()

  console.log("Aplicação inicializada com sucesso!")
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", init)