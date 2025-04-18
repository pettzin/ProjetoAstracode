// dark-mode.js

// Função para alternar o tema
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Atualizar o atributo data-theme
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Salvar a preferência no localStorage
    localStorage.setItem('theme', newTheme);
    
    console.log('Tema alterado para:', newTheme);
  }
  
  // Função para aplicar o tema salvo
  function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    console.log('Tema aplicado:', savedTheme);
  }
  
  // Aplicar o tema salvo ao carregar a página
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, aplicando tema salvo');
    applySavedTheme();
    
    // Adicionar evento de clique ao botão de toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      console.log('Botão de tema encontrado, adicionando evento de clique');
      themeToggle.addEventListener('click', toggleTheme);
    } else {
      console.error('Botão de tema não encontrado!');
    }
  });
