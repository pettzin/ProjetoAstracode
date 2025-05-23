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
    return false
  }
}

/**
 * Fetches all contacts from the API
 */
export const fetchContacts = async (state) => {
  showLoading();
  try {
    const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.SELECT}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro ao buscar contatos:", errorText);
      throw new Error("Erro ao buscar contatos");
    }

    const data = await response.json();
    console.log("Contatos carregados com sucesso:", data);

    // Transform API data to nosso formato
    state.contacts = data.map((contact) => ({
      id: contact.id,
      name: contact.nome || "",
      sobrenome: contact.sobrenome || "",
      phone: contact.telefone || "",
      email: contact.email || "",
      avatar: contact.imagem || "../img/iconContact.png",
      category: contact.grupo || "todos",
      date: new Date(contact.data_criacao || Date.now()),
    }));

    console.log("Estado inicial dos contatos:", state.contacts);

    renderContacts(state);

    // Atualizar os grupos com base nos contatos carregados
    state.groups = getUniqueGroups(state.contacts);
    console.log("Grupos carregados:", state.groups);

    renderGroups(state.groups);
  } catch (error) {
    console.error("Erro ao buscar contatos:", error);
  } finally {
    hideLoading();
  }
};

/**
 * Creates a new contact via API
 * @param {Object} contact - The contact to create
 * @returns {Promise<boolean>} - Success status
 */
export const createContact = async (contact, state) => {
  showLoading()
  try {
    // Remover máscara do número de telefone
    const unmaskedPhone = contact.phone.replace(/\D/g, "") // Remove tudo que não for dígito

    // Verificar se o número de telefone tem exatamente 10 ou 11 dígitos
    const phoneRegex = /^\d{10,11}$/
    if (!phoneRegex.test(unmaskedPhone)) {
      throw new Error("O número de telefone deve conter exatamente 10 ou 11 dígitos.")
    }

    // Verificar se o número de telefone já existe
    const isDuplicate = state.contacts.some((c) => c.phone.replace(/\D/g, "") === unmaskedPhone)
    if (isDuplicate) {
      throw new Error("O número de telefone já está cadastrado. Por favor, insira um número diferente.")
    }

    // Verificar se o e-mail é válido (se fornecido)
    if (contact.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(contact.email)) {
        throw new Error("O e-mail fornecido não é válido. Por favor, insira um e-mail no formato correto.")
      }
    }

    // Criar o corpo da requisição
    const requestBody = {
      nome: contact.name,
      sobrenome: contact.sobrenome || "",
      email: contact.email || "",
      telefone: contact.phone, // Enviar o número com a máscara, se necessário
      grupo: contact.category || "todos",
      imagem: contact.avatar,
    }

    console.log("Enviando dados:", requestBody)

    const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.INSERT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })


    // Registrar log de criação de contato
    logContactCreated(contact)

    await fetchContacts(state)
    showSuccess("Contato criado com sucesso! O novo contato foi adicionado à lista.")
    return true
  } catch (error) {
    console.error("Erro ao criar contato:", error)
    showError(error.message || "Erro ao criar contato. Certifique-se de que os dados estão corretos e o servidor está acessível.")
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
  showLoading();
  try {
    // Remover máscara do número de telefone
    const unmaskedPhone = contact.phone.replace(/\D/g, ""); // Remove tudo que não for dígito

    // Verificar se o número de telefone tem exatamente 10 ou 11 dígitos
    const phoneRegex = /^\d{10,11}$/;
    if (!phoneRegex.test(unmaskedPhone)) {
      throw new Error("O número de telefone deve conter exatamente 10 ou 11 dígitos.");
    }

    // Verificar se o número de telefone já existe em outro contato
    const isDuplicate = state.contacts.some(
      (c) => c.phone.replace(/\D/g, "") === unmaskedPhone && c.id !== contact.id
    );
    if (isDuplicate) {
      throw new Error("O número de telefone já está cadastrado em outro contato. Por favor, insira um número diferente.");
    }

    // Verificar se o e-mail é válido (se fornecido)
    if (contact.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact.email)) {
        throw new Error("O e-mail fornecido não é válido. Por favor, insira um e-mail no formato correto.");
      }
    }

    // Criar o corpo da requisição
    const requestBody = {
      nome: contact.name,
      sobrenome: contact.sobrenome,
      email: contact.email || "",
      telefone: contact.phone, // Enviar o número com a máscara, se necessário
      grupo: contact.category,
      imagem: contact.avatar,
    };

    const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.UPDATE(contact.id)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Erro ao atualizar contato");
    }

    // Registrar log de atualização de contato
    logContactUpdated(contact);

    await fetchContacts(state);
    showSuccess("Contato atualizado com sucesso! As alterações foram salvas.");
    return true;
  } catch (error) {
    console.error("Erro ao atualizar contato:", error);
    showError(error.message || "Erro ao atualizar contato. Verifique os dados fornecidos e tente novamente.");
    return false;
  } finally {
    hideLoading();
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
    console.log(`Tentando excluir contato ID: ${contactId}`);

    const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.DELETE(contactId)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text(); // Capturar o texto do erro
      console.error("Erro ao excluir contato:", errorText);
      throw new Error("Erro ao excluir contato");
    }

    console.log(`Contato ID ${contactId} excluído com sucesso`);
    logContactDeleted({ id: contactId });

    // Atualizar a lista de contatos
    await fetchContacts(state);

    // Exibir o alerta de sucesso apenas após o carregamento bem-sucedido
    showSuccess("Contato excluído com sucesso! A lista foi atualizada.", 7000);

    return true;
  } catch (error) {
    console.error("Erro ao excluir contato:", error);
    showError("Erro ao excluir contato. Certifique-se de que o servidor está acessível e tente novamente.");
    return false;
  } finally {
    hideLoading();
  }
};