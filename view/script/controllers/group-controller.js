// Group Controller
// Responsável por gerenciar grupos e associações de contatos

import { API } from "./api-controller.js"
import { showLoading, hideLoading } from "./dom-controller.js"
import { showSuccess } from "./notification-controller.js"
import { logAction } from "./log-controller.js"

/**
 * Cria um novo grupo e associa contatos a ele
 * @param {string} groupName - Nome do grupo a ser criado
 * @param {Array} contactIds - IDs dos contatos a serem associados ao grupo
 * @returns {Promise<boolean>} - Status de sucesso
 */
export const createGroup = async (groupName, contactIds, state) => {
  showLoading();

  try {
    if (!groupName || groupName.trim() === "") {
      throw new Error("O nome do grupo é obrigatório. Por favor, insira um nome válido.");
    }

    if (!contactIds || contactIds.length === 0) {
      throw new Error("Selecione pelo menos um contato para associar ao grupo.");
    }

    // Atualizar o campo 'grupo' para cada contato selecionado
    const updatePromises = contactIds.map((contactId) =>
      fetch(`${API.BASE_URL}${API.ENDPOINTS.UPDATE(contactId)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grupo: groupName,
        }),
      })
    );

    const results = await Promise.allSettled(updatePromises);

    const allSuccessful = results.every((result) => result.status === "fulfilled" && result.value.ok);

    

    // Adicionar o novo grupo ao estado existente
    state.groups = [...state.groups, { id: groupName, name: groupName }];
    console.log("Grupos atualizados após criação:", state.groups);

    renderGroups(state.groups);

    showSuccess(`Grupo "${groupName}" criado com sucesso!`);
    return true;
  } catch (error) {
    console.error("Erro ao criar grupo:", error);
    
    return false;
  } finally {
    hideLoading();
  }
};

/**
 * Atualiza os contatos associados a um grupo
 * @param {string} groupName - Nome do grupo
 * @param {Array} contactsToAdd - IDs dos contatos a serem adicionados ao grupo
 * @param {Array} contactsToRemove - IDs dos contatos a serem removidos do grupo
 * @returns {Promise<boolean>} - Status de sucesso
 */
export const updateGroupMembers = async (groupName, contactsToAdd, contactsToRemove) => {
  showLoading()

  try {
    const updatePromises = []

    // Adicionar contatos ao grupo
    if (contactsToAdd && contactsToAdd.length > 0) {
      contactsToAdd.forEach((contactId) => {
        updatePromises.push(
          fetch(`${API.BASE_URL}${API.ENDPOINTS.UPDATE(contactId)}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              grupo: groupName,
            }),
          }),
        )
      })
    }

    // Remover contatos do grupo (definir como "todos")
    if (contactsToRemove && contactsToRemove.length > 0) {
      contactsToRemove.forEach((contactId) => {
        updatePromises.push(
          fetch(`${API.BASE_URL}${API.ENDPOINTS.UPDATE(contactId)}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              grupo: "todos",
            }),
          }),
        )
      })
    }

    // Aguardar todas as atualizações
    const results = await Promise.allSettled(updatePromises)

    // Verificar se todas as atualizações foram bem-sucedidas
    const allSuccessful = results.every((result) => result.status === "fulfilled" && result.value.ok)

    

    // Registrar log de atualização de grupo
    logAction("updateGroup", "system", {
      groupName,
      added: contactsToAdd.length,
      removed: contactsToRemove.length,
      message: `Grupo "${groupName}" atualizado: ${contactsToAdd.length} contatos adicionados, ${contactsToRemove.length} contatos removidos`,
    })

    showSuccess(`Grupo "${groupName}" atualizado com sucesso!`)
    return true
  } catch (error) {
    console.error("Erro ao atualizar grupo:", error)
    return false
  } finally {
    hideLoading()
  }
}

/**
 * Obtém todos os grupos únicos a partir dos contatos
 * @param {Array} contacts - Lista de contatos
 * @returns {Array} - Lista de grupos únicos
 */
export const getUniqueGroups = (contacts) => {
  if (!contacts || contacts.length === 0) {
    console.log("Nenhum contato encontrado. Retornando grupo padrão.");
    return [{ id: "todos", name: "Todos" }];
  }

  const uniqueGroups = new Set();
  contacts.forEach((contact) => {
    if (contact.category && contact.category !== "todos") {
      uniqueGroups.add(contact.category);
    }
  });

  const groups = [{ id: "todos", name: "Todos" }];
  uniqueGroups.forEach((groupName) => {
    groups.push({
      id: groupName,
      name: groupName,
    });
  });

  console.log("Grupos únicos extraídos:", groups);
  return groups;
};

/**
 * Exclui um grupo (define o grupo de todos os contatos como "todos")
 * @param {string} groupName - Nome do grupo a ser excluído
 * @param {Array} contacts - Lista de contatos
 * @returns {Promise<boolean>} - Status de sucesso
 */
export const deleteGroup = async (groupName, contacts) => {
  showLoading()

  try {
    // Encontrar todos os contatos que pertencem ao grupo
    const contactsInGroup = contacts.filter((contact) => contact.category === groupName)

    if (contactsInGroup.length === 0) {
      // Não há contatos neste grupo, consideramos como sucesso
      showSuccess(`Grupo "${groupName}" excluído com sucesso!`)
      return true
    }

    // Atualizar todos os contatos do grupo para "todos"
    const updatePromises = contactsInGroup.map((contact) =>
      fetch(`${API.BASE_URL}${API.ENDPOINTS.UPDATE(contact.id)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grupo: "todos",
        }),
      }),
    )

    // Aguardar todas as atualizações
    const results = await Promise.allSettled(updatePromises)

    // Verificar se todas as atualizações foram bem-sucedidas
    const allSuccessful = results.every((result) => result.status === "fulfilled" && result.value.ok)

    if (!allSuccessful) {
      throw new Error("Não foi possível remover todos os contatos do grupo. Verifique os dados e tente novamente.")
    }

    // Registrar log de exclusão de grupo
    logAction("deleteGroup", "system", {
      groupName,
      contactsCount: contactsInGroup.length,
      message: `Grupo "${groupName}" excluído com ${contactsInGroup.length} contatos`,
    })

    showSuccess(`Grupo "${groupName}" excluído com sucesso!`)
    return true
  } catch (error) {
    console.error("Erro ao excluir grupo:", error)
    return false
  } finally {
    hideLoading()
  }
}
