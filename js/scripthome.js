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
  
      // Referência para o item de contato que está sendo editado
      let currentEditingItem = null;
  
      // Cria o item de contato na lista com os dados e eventos necessários
      function createContactListItem(contact) {
        const listItem = document.createElement('li');
        listItem.classList.add('contact-item');
        // Armazena os dados do contato no dataset
        listItem.dataset.contact = JSON.stringify(contact);
        
        // Ícone do contato
        const icon = document.createElement('i');
        icon.classList.add('fas', 'fa-user', 'contact-icon');
        
        // Link com o nome do contato
        const link = document.createElement('a');
        link.href = "#";
        link.textContent = contact.name;
        link.classList.add('contact-link');
        
        listItem.appendChild(icon);
        listItem.appendChild(link);      
        // Ao clicar no item, abre o diálogo de edição com os dados preenchidos
        listItem.addEventListener('click', (e) => {
          const contactData = JSON.parse(listItem.dataset.contact);
          document.getElementById('editName').value = contactData.name;
          document.getElementById('editEmail').value = contactData.email;
          document.getElementById('editPhone').value = contactData.phone;
          currentEditingItem = listItem;
          document.getElementById('contactDetailDialog').showModal();
        });
        
        return listItem;
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
        
        const updatedContact = {
          name: updatedName,
          email: updatedEmail.toLowerCase(),
          phone: updatedPhone
        };
        
        // Atualiza os dados no dataset e no texto do item
        currentEditingItem.dataset.contact = JSON.stringify(updatedContact);
        currentEditingItem.querySelector('.contact-link').textContent = updatedName;
        
        saveContactsToLocalStorage();
        document.getElementById('contactDetailDialog').close();
      });
  
      // Evento para excluir o contato via diálogo de edição
      document.getElementById('deleteContact').addEventListener('click', () => {
        if (currentEditingItem) {
          currentEditingItem.remove();
          saveContactsToLocalStorage();
          document.getElementById('contactDetailDialog').close();
        }
      });
      
      // Evento para enviar a mensagem via WhatsApp
      document.getElementById('btmsg').addEventListener('click', () => {
        // Pega o número do telefone do campo de edição
        const phone = document.getElementById('editPhone').value.trim();
        // Pega a mensagem do campo de mensagem
        const message = document.getElementById('boxmensagem').value.trim();
        
        if (!phone) {
          alert("Número de telefone inválido!");
          return;
        }
        if (!message) {
          alert("Por favor, digite uma mensagem.");
          return;
        }
        
        // Cria a URL para enviar via WhatsApp (encodeURIComponent substitui espaços por %20)
        const waLink = "https://wa.me/" + phone + "/?text=" + encodeURIComponent(message);
        
        // Abre a URL em uma nova aba
        window.open(waLink, "_blank");
      });
      
      // Manipulação do diálogo de cadastro
      const openDialogButton = document.getElementById('openDialog');
      const contactDialog = document.getElementById('contactDialog');
      const closeDialogButton = document.getElementById('closeDialog');
      const contactForm = document.getElementById('contactForm');
      const contactList = document.getElementById('contactList');
      
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
        
        const contact = {
          name: name,
          email: emailLowerCase,
          phone: phone
        };
        
        const listItem = createContactListItem(contact);
        contactList.appendChild(listItem);
        
        contactForm.reset();
        contactDialog.close();
        saveContactsToLocalStorage();
      });
      
      // Salva os contatos no localStorage
      function saveContactsToLocalStorage() {
        const contacts = [];
        const contactItems = document.querySelectorAll('.contact-item');
        contactItems.forEach(item => {
          contacts.push(JSON.parse(item.dataset.contact));
        });
        localStorage.setItem('contacts', JSON.stringify(contacts));
      }
      
      // Carrega os contatos do localStorage
      function loadContactsFromLocalStorage() {
        const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
        contacts.forEach(contact => {
          const listItem = createContactListItem(contact);
          contactList.appendChild(listItem);
        });
      }
      
      window.addEventListener('DOMContentLoaded', loadContactsFromLocalStorage);
