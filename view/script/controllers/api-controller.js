// API Controller
// Responsável por todas as interações com a API

import { showLoading, hideLoading } from "./dom-controller.js"
import { updateContactSelect, renderContacts } from "./view-controller.js"
import { logContactCreated, logContactUpdated, logContactDeleted } from './log-controller.js';
import { showError, showSuccess } from "./notification-controller.js"

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
    
    // Mensagem de erro mais específica baseada no problema
    if (error.message.includes("Failed to fetch")) {
      showError("Erro de conexão: Servidor indisponível ou URL incorreta. Verifique se o servidor está rodando na porta 3000.")
    } else if (error.message.includes("404")) {
      showError("Erro 404: Endpoint de API não encontrado. Verifique a configuração da rota /api/contatos no servidor.")
    } else if (error.message.includes("500")) {
      showError("Erro 500: Erro interno no servidor. Por favor, verifique os logs do servidor.")
    } else {
      showError(`Falha na conexão com o servidor: ${error.message}. Verifique se o servidor está rodando.`)
    }
    
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
      throw new Error(`Erro ao buscar contatos: Código de status ${response.status}`)
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
    
    // Exibir mensagem no grid de contatos
    const contactsGrid = document.getElementById("contactsGrid")
    if (contactsGrid) {
      contactsGrid.innerHTML = '<div class="no-contacts">Erro ao carregar contatos. Tente novamente mais tarde.</div>'
    }
    
    // Mensagem de erro mais específica baseada no problema
    if (error.message.includes("Failed to fetch")) {
      showError("Falha na conexão: Servidor indisponível. Verifique a conexão com a internet ou se o servidor está ativo.")
    } else if (error.message.includes("404")) {
      showError("Endpoint não encontrado: A rota de API para listar contatos não existe no servidor.")
    } else if (error.message.includes("500")) {
      showError("Erro interno do servidor: Ocorreu um problema ao processar a requisição de contatos.")
    } else {
      showError(`Erro ao carregar contatos: ${error.message}. Tente novamente mais tarde.`)
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
    if (!contact.name) {
      throw new Error("Campo nome é obrigatório.")
    }
    
    if (!contact.phone) {
      throw new Error("Campo telefone é obrigatório.")
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
      
      if (response.status === 400) {
        throw new Error(`Erro de validação: ${errorText || "Dados inválidos"}`)
      } else if (response.status === 409) {
        throw new Error("Conflito: Contato com este telefone já existe")
      } else if (response.status === 500) {
        throw new Error("Erro interno do servidor ao criar contato")
      } else {
        throw new Error(`Erro ao criar contato: Código ${response.status}`)
      }
    }

    // Registrar log de criação de contato
    logContactCreated(contact);

    await fetchContacts(state)
    showSuccess("Contato criado com sucesso!")
    return true
  } catch (error) {
    console.error("Erro ao criar contato:", error)
    
    // Mensagem de erro mais específica baseada no problema
    if (error.message.includes("nome é obrigatório")) {
      showError("Erro de validação: O campo nome é obrigatório.")
    } else if (error.message.includes("telefone é obrigatório")) {
      showError("Erro de validação: O campo telefone é obrigatório.")
    } else if (error.message.includes("Failed to fetch")) {
      showError("Erro de conexão: Não foi possível conectar ao servidor para criar o contato.")
    } else if (error.message.includes("Conflito")) {
      showError("Erro de duplicidade: Já existe um contato com este número de telefone.")
    } else if (error.message.includes("validação")) {
      showError(error.message)
    } else {
      showError(`Falha ao criar contato: ${error.message}`)
    }
    
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
    // Validações básicas
    if (!contact.id) {
      throw new Error("ID do contato não fornecido para atualização")
    }
    
    if (!contact.name) {
      throw new Error("Campo nome é obrigatório")
    }
    
    if (!contact.phone) {
      throw new Error("Campo telefone é obrigatório")
    }
    
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
      const errorText = await response.text()
      console.error("Resposta do servidor:", errorText)
      
      if (response.status === 404) {
        throw new Error(`Contato com ID ${contact.id} não encontrado no servidor`)
      } else if (response.status === 400) {
        throw new Error(`Erro de validação: ${errorText || "Dados inválidos"}`)
      } else if (response.status === 409) {
        throw new Error("Conflito: Este número de telefone já está sendo usado por outro contato")
      } else if (response.status === 500) {
        throw new Error("Erro interno do servidor ao atualizar contato")
      } else {
        throw new Error(`Erro ao atualizar contato: Código ${response.status}`)
      }
    }

    // Registrar log de atualização de contato
    logContactUpdated(contact);

    await fetchContacts(state)
    showSuccess("Contato atualizado com sucesso!")
    return true
  } catch (error) {
    console.error("Erro ao atualizar contato:", error)
    
    // Mensagem de erro mais específica baseada no problema
    if (error.message.includes("ID do contato não fornecido")) {
      showError("Erro: ID do contato não encontrado ou inválido.")
    } else if (error.message.includes("nome é obrigatório")) {
      showError("Erro de validação: O campo nome é obrigatório.")
    } else if (error.message.includes("telefone é obrigatório")) {
      showError("Erro de validação: O campo telefone é obrigatório.")
    } else if (error.message.includes("não encontrado")) {
      showError(`Erro: ${error.message}. O contato pode ter sido excluído por outro usuário.`)
    } else if (error.message.includes("Failed to fetch")) {
      showError("Erro de conexão: Não foi possível conectar ao servidor para atualizar o contato.")
    } else if (error.message.includes("Conflito")) {
      showError("Erro de duplicidade: O número de telefone já está em uso por outro contato.")
    } else {
      showError(`Falha ao atualizar contato: ${error.message}`)
    }
    
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
  showLoading();
  try {
    if (!contactId) {
      throw new Error("ID de contato inválido para exclusão");
    }
    
    console.log(`Tentando excluir contato ID: ${contactId}`);
    
    const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.DELETE(contactId)}`, {
      method: "DELETE",
    });
    
    console.log(`Resposta do servidor:`, response);
    
    if (!response.ok) {
      const responseText = await response.text();
      console.log(`Texto da resposta:`, responseText);
      
      if (response.status === 404) {
        throw new Error(`Contato com ID ${contactId} não encontrado no servidor`)
      } else if (response.status === 500) {
        throw new Error("Erro interno do servidor ao excluir contato")
      } else {
        throw new Error(`Erro ao excluir contato: Código ${response.status}`)
      }
    }
    
    // Se chegou até aqui, consideramos a operação bem-sucedida
    console.log(`Contato ID ${contactId} excluído com sucesso`);
    
    // Registrar log de exclusão de contato
    logContactDeleted({id: contactId});
    
    showSuccess("Contato excluído com sucesso!");
    
    try {
      await fetchContacts(state);
    } catch (fetchError) {
      console.error("Erro ao atualizar lista de contatos:", fetchError);
      // Não tratamos como erro fatal, apenas logamos
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao excluir contato:", error);
    
    // Mensagem de erro mais específico
    if (error.message.includes("ID de contato inválido")) {
      showError("Erro: ID de contato inválido ou não especificado para exclusão.")
    } else if (error.message.includes("não encontrado")) {
      showError(`Erro: ${error.message}. O contato pode ter sido excluído anteriormente.`)
    } else if (error.message.includes("Failed to fetch")) {
      showError("Erro de conexão: Não foi possível conectar ao servidor para excluir o contato.")
    } else if (error.message.includes("500")) {
      showError("Erro interno do servidor: Ocorreu um problema ao processar a exclusão do contato.")
    } else {
      showError(`Falha ao excluir contato: ${error.message}`)
    }
    
    return false;
  } finally {
    hideLoading();
  }
}