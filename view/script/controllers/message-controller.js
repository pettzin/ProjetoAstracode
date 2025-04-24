// Message Controller
// Responsável por todas as funções relacionadas a mensagens

import { closeDialogs, elementExists } from "./dom-controller.js"
import { formatDate, formatTime } from "./utils.js"
// Importar as funções de notificação
import { showError, showSuccess, showWarning, showConfirm } from "./notification-controller.js"

/**
 * Sets the default date and time for message scheduling
 */
export const setDefaultDateTime = () => {
  const now = new Date()
  const dateInput = document.getElementById("messageDate")
  const timeInput = document.getElementById("messageTime")

  if (elementExists(dateInput, "messageDate") && elementExists(timeInput, "messageTime")) {
    dateInput.value = formatDate(now)
    timeInput.value = formatTime(now)
  }
}

/**
 * Agenda uma mensagem para ser enviada em um horário específico
 */
export const sendMessage = (state) => {
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
    showWarning("Selecione um contato para enviar a mensagem.")
    return
  }

  if (!text) {
    showWarning("O campo de mensagem não pode estar vazio.")
    return
  }

  if (!date || !time) {
    showWarning("Data e hora de agendamento são obrigatórios.")
    return
  }

  const contact = state.contacts.find((c) => c.id === selectedContactId)
  if (contact) {
    const scheduledDateTime = new Date(`${date}T${time}`)

    // Verificar se a data é válida
    if (isNaN(scheduledDateTime.getTime())) {
      showError("Formato de data ou hora inválido. Use o formato DD/MM/AAAA para data e HH:MM para hora.")
      return
    }

    // Verificar se a data não é no passado
    if (scheduledDateTime < new Date()) {
      showError("Data de agendamento no passado. Selecione uma data e hora futura.")
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
    scheduleMessageAlert(scheduledMessage, state)

    showSuccess(`Mensagem agendada para ${contact.name} às ${scheduledDateTime.toLocaleString()}: ${text}`)
    closeDialogs()
  } else {
    showError("Contato selecionado não foi encontrado na lista de contatos.")
  }
}

/**
 * Salva uma mensagem agendada no localStorage
 * @param {Object} scheduledMessage - A mensagem agendada
 */
export const saveScheduledMessage = (scheduledMessage) => {
  try {
    // Obter mensagens agendadas existentes
    const scheduledMessages = JSON.parse(localStorage.getItem("scheduledMessages") || "[]")

    // Adicionar nova mensagem
    scheduledMessages.push(scheduledMessage)

    // Salvar de volta no localStorage
    localStorage.setItem("scheduledMessages", JSON.stringify(scheduledMessages))

    console.log("Mensagem agendada salva:", scheduledMessage)
  } catch (error) {
    console.error("Erro ao salvar mensagem no localStorage:", error)
    showError("Falha ao salvar o agendamento. Verifique o espaço disponível no navegador.")
  }
}

/**
 * Configura um temporizador para exibir o alerta no momento agendado
 * @param {Object} scheduledMessage - A mensagem agendada
 */
export const scheduleMessageAlert = (scheduledMessage, state) => {
  const now = new Date().getTime()
  const delay = scheduledMessage.scheduledTime - now

  // Se o tempo já passou, não agendar
  if (delay <= 0) {
    console.warn("Tempo de agendamento já passou, não será agendado:", scheduledMessage)
    return
  }

  console.log(`Agendando alerta para mensagem ID ${scheduledMessage.id} em ${Math.floor(delay / 1000)} segundos`)

  // Configurar o temporizador
  setTimeout(() => {
    const contact = state.contacts.find((c) => c.id === scheduledMessage.contactId)

    if (contact) {
      const phoneNumber = contact.phone.replace(/\D/g, "")
      if (!phoneNumber) {
        showError(`Não foi possível enviar mensagem para ${contact.name}: número de telefone inválido.`)
        removeScheduledMessage(scheduledMessage.id)
        return
      }
      
      const encodedMessage = encodeURIComponent(scheduledMessage.message)
      const whatsappLink = `https://wa.me/${phoneNumber}/?text=${encodedMessage}`

      // Exibir alerta com opção para enviar a mensagem
      showConfirm(
        `Hora de enviar a mensagem agendada para ${contact.name}:\n\n${scheduledMessage.message}\n\nClique em OK para abrir o WhatsApp e enviar a mensagem.`
      ).then((confirmed) => {
        if (confirmed) {
          window.open(whatsappLink, "_blank")
        }
        // Remover a mensagem da lista de agendamentos
        removeScheduledMessage(scheduledMessage.id)
      })
    } else {
      showError("Contato não encontrado. O contato pode ter sido excluído desde o agendamento.")
      removeScheduledMessage(scheduledMessage.id)
    }
  }, delay)
}

/**
 * Remove uma mensagem agendada do localStorage
 * @param {number} messageId - O ID da mensagem a ser removida
 */
export const removeScheduledMessage = (messageId) => {
  try {
    // Obter mensagens agendadas existentes
    const scheduledMessages = JSON.parse(localStorage.getItem("scheduledMessages") || "[]")

    // Filtrar a mensagem a ser removida
    const updatedMessages = scheduledMessages.filter((msg) => msg.id !== messageId)

    // Salvar de volta no localStorage
    localStorage.setItem("scheduledMessages", JSON.stringify(updatedMessages))

    console.log("Mensagem agendada removida:", messageId)
  } catch (error) {
    console.error("Erro ao remover mensagem agendada:", error)
    showError("Falha ao remover agendamento do armazenamento local.")
  }
}

/**
 * Envia mensagem via WhatsApp
 */
export const sendWhatsAppMessage = (state) => {
  const messageText = document.getElementById("messageText")

  // Verificar se o elemento existe
  if (!elementExists(messageText, "messageText")) {
    showError("Campo de mensagem não encontrado na interface.")
    return
  }

  const text = messageText.value.trim()

  if (!text) {
    showWarning("O campo de mensagem não pode estar vazio.")
    return
  }

  const contact = state.contacts.find((c) => c.id === state.currentContactId)
  if (!contact) {
    showError("Contato não encontrado na lista de contatos.")
    return
  }
  
  if (!contact.phone) {
    showError(`O contato ${contact.name} não possui número de telefone cadastrado.`)
    return
  }

  // Remover caracteres não numéricos do telefone
  const phoneNumber = contact.phone.replace(/\D/g, "")

  if (!phoneNumber) {
    showError(`Número de telefone inválido para o contato ${contact.name}.`)
    return
  }

  const encodedMessage = encodeURIComponent(text)
  const whatsappLink = `https://wa.me/${phoneNumber}/?text=${encodedMessage}`

  try {
    window.open(whatsappLink, "_blank")
    closeDialogs()
  } catch (error) {
    console.error("Erro ao abrir WhatsApp:", error)
    showError("Não foi possível abrir o WhatsApp. Verifique as permissões do navegador para abrir links.")
  }
}