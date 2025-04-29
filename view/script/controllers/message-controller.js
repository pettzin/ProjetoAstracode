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
    showWarning("Por favor, selecione um contato para enviar a mensagem.")
    return
  }

  if (!text) {
    showWarning("Por favor, escreva o conteúdo da mensagem antes de agendar.")
    return
  }

  if (!date || !time) {
    showWarning("Selecione uma data e hora válidas para o agendamento.")
    return
  }

  const contact = state.contacts.find((c) => c.id === selectedContactId)
  if (contact) {
    const scheduledDateTime = new Date(`${date}T${time}`)

    // Verificar se a data é válida
    if (isNaN(scheduledDateTime.getTime())) {
      showError("Data ou hora inválida. Por favor, insira uma data e hora no formato correto.")
      return
    }

    // Verificar se a data não é no passado
    if (scheduledDateTime < new Date()) {
      showError("Não é possível agendar mensagens para o passado. Por favor, escolha uma data e hora futura.")
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

    showSuccess(`Mensagem agendada com sucesso para ${contact.name} às ${scheduledDateTime.toLocaleString()}: "${text}"`)
    closeDialogs()
  }
}

/**
 * Salva uma mensagem agendada no localStorage
 * @param {Object} scheduledMessage - A mensagem agendada
 */
export const saveScheduledMessage = (scheduledMessage) => {
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
export const scheduleMessageAlert = (scheduledMessage, state) => {
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
      showConfirm(
        `Hora de enviar a mensagem agendada para ${contact.name}:\n\n"${scheduledMessage.message}"\n\nClique em OK para abrir o WhatsApp e enviar a mensagem.`
      ).then((confirmed) => {
        if (confirmed) {
          window.open(whatsappLink, "_blank")
        }
        // Remover a mensagem da lista de agendamentos
        removeScheduledMessage(scheduledMessage.id)
      })
    }
  }, delay)
}

/**
 * Remove uma mensagem agendada do localStorage
 * @param {number} messageId - O ID da mensagem a ser removida
 */
export const removeScheduledMessage = (messageId) => {
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
export const sendWhatsAppMessage = (state) => {
  const messageText = document.getElementById("messageText")

  // Verificar se o elemento existe
  if (!elementExists(messageText, "messageText")) return

  const text = messageText.value.trim()

  if (!text) {
    showWarning("Por favor, escreva o conteúdo da mensagem antes de enviar.")
    return
  }

  const contact = state.contacts.find((c) => c.id === state.currentContactId)
  if (contact && contact.phone) {
    // Remover caracteres não numéricos do telefone
    const phoneNumber = contact.phone.replace(/\D/g, "")

    if (!phoneNumber) {
      showError("Número de telefone inválido. Por favor, verifique o contato.")
      return
    }

    const encodedMessage = encodeURIComponent(text)
    const whatsappLink = `https://wa.me/${phoneNumber}/?text=${encodedMessage}`

    window.open(whatsappLink, "_blank")
    closeDialogs()
  } else {
    showError("Contato não encontrado ou sem número de telefone válido.")
  }
}