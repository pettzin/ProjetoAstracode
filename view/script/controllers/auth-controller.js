// Auth Controller
// Responsável por gerenciar autenticação, login e cadastro

/**
 * Função para salvar usuário
 * @param {string} nome - Nome do usuário
 * @param {string} email - Email do usuário
 * @param {string} telefone - Telefone do usuário
 * @param {string} senha - Senha do usuário
 * @returns {boolean} - Se o cadastro foi bem-sucedido
 */
export const salvarUsuario = (nome, email, telefone, senha) => {
  // Verificar se já existe um array de usuários
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || []

  // Verificar se o email já está cadastrado
  const emailExistente = usuarios.some((usuario) => usuario.email === email)
  if (emailExistente) {
    alert("Este email já está cadastrado!")
    return false
  }

  // Adicionar novo usuário
  const novoUsuario = {
    nome: nome,
    email: email,
    telefone: telefone,
    senha: senha,
    avatar: "../img/iconContact.png", // Avatar padrão
    role: "Usuário", // Papel padrão
  }

  usuarios.push(novoUsuario)

  // Salvar array atualizado
  localStorage.setItem("usuarios", JSON.stringify(usuarios))
  return true
}

/**
 * Função para verificar login
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha do usuário
 * @returns {Object|null} - Usuário encontrado ou null
 */
export const verificarLogin = (email, senha) => {
  // Obter array de usuários do localStorage
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || []

  // Verificar se existe um usuário com o email e senha fornecidos
  const usuarioEncontrado = usuarios.find((usuario) => usuario.email === email && usuario.senha === senha)

  return usuarioEncontrado
}

/**
 * Função para realizar logout
 */
export const realizarLogout = () => {
  localStorage.removeItem("usuarioLogado")
  window.location.href = "index.html"
}

/**
 * Função para obter usuário logado
 * @returns {Object|null} - Usuário logado ou null
 */
export const getUsuarioLogado = () => {
  const usuarioLogado = localStorage.getItem("usuarioLogado")
  return usuarioLogado ? JSON.parse(usuarioLogado) : null
}

/**
 * Função para atualizar dados do usuário
 * @param {Object} dadosAtualizados - Dados atualizados do usuário
 * @returns {boolean} - Se a atualização foi bem-sucedida
 */
export const atualizarUsuario = (dadosAtualizados) => {
  // Obter array de usuários do localStorage
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || []

  // Encontrar o índice do usuário
  const index = usuarios.findIndex((u) => u.email === dadosAtualizados.email)

  if (index === -1) {
    alert("Usuário não encontrado!")
    return false
  }

  // Atualizar os dados do usuário
  usuarios[index] = { ...usuarios[index], ...dadosAtualizados }

  // Salvar array atualizado
  localStorage.setItem("usuarios", JSON.stringify(usuarios))

  // Atualizar usuário logado se for o mesmo
  const usuarioLogado = getUsuarioLogado()
  if (usuarioLogado && usuarioLogado.email === dadosAtualizados.email) {
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarios[index]))
  }

  return true
}

/**
 * Função para alterar a senha do usuário
 * @param {string} email - Email do usuário
 * @param {string} senhaAtual - Senha atual
 * @param {string} novaSenha - Nova senha
 * @returns {boolean} - Se a alteração foi bem-sucedida
 */
export const alterarSenha = (email, senhaAtual, novaSenha) => {
  // Obter array de usuários do localStorage
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || []

  // Encontrar o usuário
  const index = usuarios.findIndex((u) => u.email === email && u.senha === senhaAtual)

  if (index === -1) {
    alert("Senha atual incorreta!")
    return false
  }

  // Atualizar a senha
  usuarios[index].senha = novaSenha

  // Salvar array atualizado
  localStorage.setItem("usuarios", JSON.stringify(usuarios))

  // Atualizar usuário logado se for o mesmo
  const usuarioLogado = getUsuarioLogado()
  if (usuarioLogado && usuarioLogado.email === email) {
    usuarioLogado.senha = novaSenha
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado))
  }

  return true
}

/**
 * Função para alterar o email do usuário
 * @param {string} emailAtual - Email atual
 * @param {string} novoEmail - Novo email
 * @param {string} senha - Senha para confirmação
 * @returns {boolean} - Se a alteração foi bem-sucedida
 */
export const alterarEmail = (emailAtual, novoEmail, senha) => {
  // Obter array de usuários do localStorage
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || []

  // Verificar se o novo email já está cadastrado
  const emailExistente = usuarios.some((usuario) => usuario.email === novoEmail)
  if (emailExistente) {
    alert("Este email já está cadastrado!")
    return false
  }

  // Encontrar o usuário
  const index = usuarios.findIndex((u) => u.email === emailAtual && u.senha === senha)

  if (index === -1) {
    alert("Senha incorreta!")
    return false
  }

  // Atualizar o email
  usuarios[index].email = novoEmail

  // Salvar array atualizado
  localStorage.setItem("usuarios", JSON.stringify(usuarios))

  // Atualizar usuário logado se for o mesmo
  const usuarioLogado = getUsuarioLogado()
  if (usuarioLogado && usuarioLogado.email === emailAtual) {
    usuarioLogado.email = novoEmail
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado))
  }

  return true
}

