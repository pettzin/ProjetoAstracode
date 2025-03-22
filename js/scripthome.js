// Alterna exibição do menu dropdown
document.querySelector('.settings-icon').addEventListener('click', () => {
  const dropdownMenu = document.getElementById('profileMenu');
  dropdownMenu.style.display = (dropdownMenu.style.display === 'block' ? 'none' : 'block');
});

// Validações simples
function validateName(name) {
  const regex = /^[a-zA-Z\s]+$/;
  return regex.test(name);
}
function validateEmail(email) {
  const regex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.(com|br|gov|org)$/;
  const validDomains = ['gmail', 'outlook', 'yahoo', 'hotmail', 'icloud'];
  const emailDomain = email.split('@')[1]?.split('.')[0];
  if (!regex.test(email)) {
    return false;
  }
  return validDomains.includes(emailDomain);
}

// Variável para armazenar o item de contato em edição
let currentEditingItem = null;

// Cria o item de contato na lista com os dados e eventos necessários
function createContactListItem(contact) {
  const listItem = document.createElement('li');
  listItem.classList.add('contact-item');
  // Armazena os dados do contato no dataset (incluindo o id)
  listItem.dataset.contact = JSON.stringify(contact);

  // Ícone do contato
  const icon = document.createElement('i');
  icon.classList.add('fas', 'fa-user', 'contact-icon');

  // Link com o nome do contato (usa o campo nome, conforme a API envia como 'nome')
  const link = document.createElement('a');
  link.href = "#";
  link.textContent = contact.nome;
  link.classList.add('contact-link');

  listItem.appendChild(icon);
  listItem.appendChild(link);
  // Ao clicar no item, abre o diálogo de edição com os dados preenchidos
  listItem.addEventListener('click', () => {
    const contactData = JSON.parse(listItem.dataset.contact);
    document.getElementById('editName').value = contactData.nome;
    document.getElementById('editEmail').value = contactData.email;
    document.getElementById('editPhone').value = contactData.telefone;
    // Armazena o id no dataset para uso em atualizações/exclusões
    listItem.dataset.id = contactData.id;
    currentEditingItem = listItem;
    document.getElementById('contactDetailDialog').showModal();
  });

  return listItem;
}

// Função para carregar os contatos da API
function loadContactsFromAPI() {
  fetch('http://127.0.0.1:3000/api/select')
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao buscar os contatos: ' + response.statusText);
      }
      return response.json();
    })
    .then(contacts => {
      const contactList = document.getElementById('contactList');
      contactList.innerHTML = ''; // Limpa a lista atual
      contacts.forEach(contact => {
        const listItem = createContactListItem(contact);
        contactList.appendChild(listItem);
      });
    })
    .catch(error => {
      console.error('Erro:', error);
    });
}

// Evento para fechar o diálogo de edição sem salvar
document.getElementById('cancelEdit').addEventListener('click', () => {
  document.getElementById('contactDetailDialog').close();
});

// Evento para salvar as alterações do contato
document.getElementById('editContactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const updatedName = document.getElementById('editName').value;
  const updatedEmail = document.getElementById('editEmail').value;
  const updatedPhone = document.getElementById('editPhone').value;

  if (!validateName(updatedName)) {
    alert('Nome deve conter apenas letras e espaços!');
    return;
  }
  if (!validateEmail(updatedEmail)) {
    alert('E-mail inválido! Verifique o formato e o domínio.');
    return;
  }

  // Obtém o id do contato armazenado
  const id = currentEditingItem.dataset.id;
  const updatedContact = {
    nome: updatedName,
    email: updatedEmail.toLowerCase(),
    telefone: updatedPhone
  };

  // Chama a API para atualizar o contato
  fetch(`http://127.0.0.1:3000/api/update/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedContact)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao atualizar o contato: ' + response.statusText);
      }
      return response.text();
    })
    .then(() => {
      // Atualiza o item na lista sem recarregar toda a lista
      let contactData = JSON.parse(currentEditingItem.dataset.contact);
      contactData.nome = updatedName;
      contactData.email = updatedEmail.toLowerCase();
      contactData.telefone = updatedPhone;
      currentEditingItem.dataset.contact = JSON.stringify(contactData);
      currentEditingItem.querySelector('.contact-link').textContent = updatedName;
      document.getElementById('contactDetailDialog').close();
    })
    .catch(error => {
      console.error('Erro:', error);
    });
});

// Evento para excluir o contato via diálogo de edição
document.getElementById('deleteContact').addEventListener('click', () => {
  if (currentEditingItem) {
    const id = currentEditingItem.dataset.id;
    fetch(`http://127.0.0.1:3000/api/delete/${id}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao deletar o contato: ' + response.statusText);
        }
        return response.text();
      })
      .then(() => {
        currentEditingItem.remove();
        document.getElementById('contactDetailDialog').close();
      })
      .catch(error => {
        console.error('Erro:', error);
      });
  }
});

// Evento para enviar mensagem via WhatsApp
document.getElementById('btmsg').addEventListener('click', () => {
  const phone = document.getElementById('editPhone').value.trim();
  const message = document.getElementById('boxmensagem').value.trim();

  if (!phone) {
    alert("Número de telefone inválido!");
    return;
  }
  if (!message) {
    alert("Por favor, digite uma mensagem.");
    return;
  }

  const waLink = "https://wa.me/" + phone + "/?text=" + encodeURIComponent(message);
  window.open(waLink, "_blank");
});

// Manipulação do diálogo de cadastro
const openDialogButton = document.getElementById('openDialog');
const contactDialog = document.getElementById('contactDialog');
const closeDialogButton = document.getElementById('closeDialog');
const contactForm = document.getElementById('contactForm');

openDialogButton.addEventListener('click', () => {
  contactDialog.showModal();
});

closeDialogButton.addEventListener('click', () => {
  contactDialog.close();
});

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;

  if (!validateName(name)) {
    alert('Nome deve conter apenas letras e espaços!');
    return;
  }

  const emailLowerCase = email.toLowerCase();
  document.getElementById('email').value = emailLowerCase;

  if (!validateEmail(emailLowerCase)) {
    alert('E-mail inválido! Verifique o formato e o domínio.');
    return;
  }

  // Prepara o objeto de contato conforme a API espera (campo "nome")
  const contact = {
    nome: name,
    email: emailLowerCase,
    telefone: phone
  };

  // Chama a API para inserir o contato
  fetch('http://127.0.0.1:3000/api/insert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contact)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro na inserção: ' + response.statusText);
      }
      return response.text();
    })
    .then(() => {
      // Após inserir, recarrega a lista de contatos
      loadContactsFromAPI();
      contactForm.reset();
      contactDialog.close();
    })
    .catch(error => {
      console.error('Erro:', error);
    });
});

// Carrega os contatos ao carregar a página
window.addEventListener('DOMContentLoaded', loadContactsFromAPI);
