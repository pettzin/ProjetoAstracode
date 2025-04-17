// Utils Controller
// Funções utilitárias para a aplicação

import { showAlert, showError } from "./notification-controller.js"

/**
 * Converts an image file to base64
 * @param {File} file - The image file to convert
 * @returns {Promise<string>} - Promise resolving to base64 string
 */
export const imageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => {
      showError("Erro ao processar o arquivo: " + (error.message || "Erro desconhecido"))
      reject(error)
    }
  })
}

/**
 * Formats a date to YYYY-MM-DD
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
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
export const formatTime = (date) => {
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${hours}:${minutes}`
}