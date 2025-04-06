// API Controller
// Responsável por todas as interações com a API

import { showLoading, hideLoading } from "./dom-controller.js"
import { updateContactSelect, renderContacts } from "./view-controller.js"

// Configuração da API
export const API = {
  BASE_URL: "http://localhost:3000",
  ENDPOINTS: {
    SELECT: "/api/contatos",
    INSERT: "/api/insert",
    UPDATE: (id) => `/api/update/${id}`,
    DELETE: (id) => `/api/delete/${id}`,
  },
};

/**
 * Verifica a conexão com a API
 * @returns {Promise<boolean>} - Se a conexão foi bem-sucedida
 */
export const checkApiConnection = async () => {
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
 * Fetches all contacts from the API
 */
export const fetchContacts = async (state) => {
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
      sobrenome: contact.sobrenome || "",
      phone: contact.telefone || "",
      email: contact.email || "",
      avatar: contact.imagem || "../img/iconContact.png",
      category: contact.grupo || "todos",
      date: new Date(contact.data_criacao || Date.now()),
    }))

    renderContacts(state)

    // Atualizar o seletor de contatos no diálogo de mensagem
    updateContactSelect(state)
  } catch (error) {
    console.error("Erro ao buscar contatos:", error)
    alert("Não foi possível carregar os contatos. Verifique a conexão com o servidor.")

    // Exibir mensagem no grid de contatos
    const contactsGrid = document.getElementById("contactsGrid")
    if (contactsGrid) {
      contactsGrid.innerHTML = '<div class="no-contacts">Erro ao carregar contatos. Tente novamente mais tarde.</div>'
    }
  } finally {
    hideLoading()
  }
}

/**
 * Creates a new contact via API
 * @param {Object} contact - The contact to create
 * @returns {Promise<boolean>} - Success status
 */
export const createContact = async (contact, state) => {
  showLoading()
  try {
    // Verificar se nome e telefone estão presentes
    if (!contact.name || !contact.phone) {
      throw new Error("Os campos nome e telefone são obrigatórios.")
    }

    // Create the request body without requiring email
    const requestBody = {
      nome: contact.name,
      sobrenome: contact.sobrenome || "",
      email: contact.email || "",
      telefone: contact.phone,
      grupo: contact.category || "todos",
    }

    console.log("Enviando dados:", requestBody)

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

    await fetchContacts(state)
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
export const updateContact = async (contact, state) => {
  showLoading()
  try {
    const requestBody = {
      nome: contact.name,
      sobrenome: contact.sobrenome,
      email: contact.email || "",
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

    await fetchContacts(state)
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
export const deleteContactAPI = async (contactId, state) => {
  showLoading()
  try {
    const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.DELETE(contactId)}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Erro ao excluir contato")
    }

    await fetchContacts(state)
    return true
  } catch (error) {
    console.error("Erro ao excluir contato:", error)
    alert("Não foi possível excluir o contato. Verifique a conexão com o servidor.")
    return false
  } finally {
    hideLoading()
  }
}

