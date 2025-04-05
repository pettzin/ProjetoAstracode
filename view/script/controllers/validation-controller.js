// Validation Controller
// Responsável por validar entradas de formulários

/**
 * Função para validar nome
 * @param {string} nome - Nome a ser validado
 * @returns {boolean} - Se o nome é válido
 */
export const validarNome = (nome) => {
  const regexNome = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s]+$/
  return regexNome.test(nome)
}

/**
 * Função para validar email
 * @param {string} email - Email a ser validado
 * @returns {boolean} - Se o email é válido
 */
export const validarEmail = (email) => {
  const regexEmail = /^[a-zA-Z0-9_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
  return regexEmail.test(email)
}

/**
 * Função para validar telefone
 * @param {string} telefone - Telefone a ser validado
 * @returns {boolean} - Se o telefone é válido
 */
export const validarTelefone = (telefone) => {
  return telefone.length >= 14
}

/**
 * Função para validar senha
 * @param {string} senha - Senha a ser validada
 * @returns {boolean} - Se a senha é válida
 */
export const validarSenha = (senha) => {
  const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/
  return regexSenha.test(senha)
}

/**
 * Função para formatar o telefone
 * @param {HTMLInputElement} input - Input de telefone
 */
export const formatarTelefone = (input) => {
  const valor = input.value.replace(/\D/g, "")
  let resultado = ""

  if (valor.length > 0) {
    resultado = "(" + valor.substring(0, Math.min(2, valor.length))
  }

  if (valor.length > 2) {
    resultado += ") " + valor.substring(2, Math.min(7, valor.length))
  }

  if (valor.length > 7) {
    resultado += "-" + valor.substring(7, Math.min(11, valor.length))
  }

  input.value = resultado
}

