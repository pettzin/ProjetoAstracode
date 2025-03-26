        // API URL base
        const API_BASE_URL = 'http://localhost:3000';
        
        // Default avatar image
        const DEFAULT_AVATAR = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/iconContact-EjbTyLvYNWCnsYPredBV9eV4PVozhW.png';
        
        // Contact data with categories
        let contacts = [];
        
        // Group data
        let groups = [
            { id: 'familia', name: 'Família', color: '#0078d7' },
            { id: 'alunos', name: 'Alunos', color: '#0078d7' },
            { id: 'trabalho', name: 'Trabalho', color: '#0078d7' },
            { id: 'amigos', name: 'Amigos', color: '#0078d7' },
            { id: 'outros', name: 'Outros', color: '#0078d7' },
            { id: 'todos', name: 'Todos', color: '#0078d7' }
        ];

        // Current filter and search state
        let currentFilter = 'todos';
        let searchTerm = '';
        let currentContactId = null;
        let currentView = 'grid';
        let currentSort = 'name';
        let currentGroupId = null;

        // DOM Elements
        const contactsGrid = document.getElementById('contactsGrid');
        const contactsList = document.getElementById('contactsList');
        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('sortSelect');
        const viewOptions = document.querySelectorAll('.view-option');
        const messageDialog = document.getElementById('messageDialog');
        const profileDialog = document.getElementById('profileDialog');
        const groupDialog = document.getElementById('groupDialog');
        const addContactBtn = document.getElementById('addContactBtn');
        const addGroupBtn = document.getElementById('addGroupBtn');
        const emailBtn = document.getElementById('emailBtn');
        const avatarInput = document.getElementById('avatarInput');
        const profileCategory = document.getElementById('profileCategory');
        const loadingSpinner = document.getElementById('loadingSpinner');

        // Show loading spinner
        function showLoading() {
            loadingSpinner.style.display = 'flex';
        }

        // Hide loading spinner
        function hideLoading() {
            loadingSpinner.style.display = 'none';
        }

        // Convert image to base64
        function imageToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
        }

        // Fetch all contacts from API
        async function fetchContacts() {
            showLoading();
            try {
                const response = await fetch(`${API_BASE_URL}/api/select`);
                if (!response.ok) {
                    throw new Error('Erro ao buscar contatos');
                }
                const data = await response.json();
                
                // Transform API data to our format
                contacts = data.map(contact => ({
                    id: contact.id,
                    name: contact.nome,
                    phone: contact.telefone,
                    email: contact.email,
                    avatar: contact.imagem || DEFAULT_AVATAR,
                    category: contact.grupo || 'outros',
                    date: new Date(contact.data_criacao || Date.now())
                }));
                
                generateContacts();
            } catch (error) {
                console.error('Erro ao buscar contatos:', error);
                alert('Não foi possível carregar os contatos. Verifique a conexão com o servidor.');
            } finally {
                hideLoading();
            }
        }

        // Create a new contact via API
        async function createContact(contact) {
            showLoading();
            try {
                const response = await fetch(`${API_BASE_URL}/api/insert`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        nome: contact.name,
                        email: contact.email,
                        telefone: contact.phone,
                        grupo: contact.category,
                        imagem: contact.avatar
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Erro ao criar contato');
                }
                
                await fetchContacts();
                return true;
            } catch (error) {
                console.error('Erro ao criar contato:', error);
                alert('Não foi possível criar o contato. Verifique a conexão com o servidor.');
                return false;
            } finally {
                hideLoading();
            }
        }

        // Update an existing contact via API
        async function updateContact(contact) {
            showLoading();
            try {
                const response = await fetch(`${API_BASE_URL}/api/update/${contact.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        nome: contact.name,
                        email: contact.email,
                        telefone: contact.phone,
                        grupo: contact.category,
                        imagem: contact.avatar
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Erro ao atualizar contato');
                }
                
                await fetchContacts();
                return true;
            } catch (error) {
                console.error('Erro ao atualizar contato:', error);
                alert('Não foi possível atualizar o contato. Verifique a conexão com o servidor.');
                return false;
            } finally {
                hideLoading();
            }
        }

        // Delete a contact via API
        async function deleteContactAPI(contactId) {
            showLoading();
            try {
                const response = await fetch(`${API_BASE_URL}/api/delete/${contactId}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    throw new Error('Erro ao excluir contato');
                }
                
                await fetchContacts();
                return true;
            } catch (error) {
                console.error('Erro ao excluir contato:', error);
                alert('Não foi possível excluir o contato. Verifique a conexão com o servidor.');
                return false;
            } finally {
                hideLoading();
            }
        }

        // Update category select options
        function updateCategorySelect() {
            profileCategory.innerHTML = '';
            groups.forEach(group => {
                if (group.id !== 'todos') {
                    const option = document.createElement('option');
                    option.value = group.id;
                    option.textContent = group.name;
                    profileCategory.appendChild(option);
                }
            });
        }

        // Set current date and time for message scheduling
        function setDefaultDateTime() {
            const now = new Date();
            const dateInput = document.getElementById('messageDate');
            const timeInput = document.getElementById('messageTime');
            
            // Format date as YYYY-MM-DD
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            dateInput.value = `${year}-${month}-${day}`;
            
            // Format time as HH:MM
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            timeInput.value = `${hours}:${minutes}`;
        }

        // Sort contacts
        function sortContacts(contacts) {
            const sortedContacts = [...contacts];
            
            switch (currentSort) {
                case 'name':
                    sortedContacts.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'name-desc':
                    sortedContacts.sort((a, b) => b.name.localeCompare(a.name));
                    break;
                case 'recent':
                    sortedContacts.sort((a, b) => b.date - a.date);
                    break;
                default:
                    sortedContacts.sort((a, b) => a.name.localeCompare(b.name));
            }
            
            return sortedContacts;
        }

        // Generate contact cards based on filter, search, and sort
        function generateContacts() {
            // Filter contacts based on category and search term
            const filteredContacts = contacts.filter(contact => {
                const matchesCategory = currentFilter === 'todos' || contact.category === currentFilter;
                const matchesSearch = searchTerm === '' || 
                    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    contact.phone.includes(searchTerm);
                return matchesCategory && matchesSearch;
            });
            
            // Sort contacts
            const sortedContacts = sortContacts(filteredContacts);
            
            // Clear both containers
            contactsGrid.innerHTML = '';
            contactsList.innerHTML = '';
            
            // Generate contacts based on current view
            if (currentView === 'grid') {
                contactsGrid.style.display = 'grid';
                contactsList.style.display = 'none';
                
                sortedContacts.forEach(contact => {
                    const contactCard = document.createElement('div');
                    contactCard.className = 'contact-card';
                    contactCard.dataset.id = contact.id;
                    contactCard.innerHTML = `
                        <img src="${contact.avatar}" alt="${contact.name}" class="contact-avatar">
                        <div class="contact-name">${contact.name}</div>
                        <div class="contact-phone">${contact.phone}</div>
                    `;
                    contactsGrid.appendChild(contactCard);

                    // Add click event to open profile dialog
                    contactCard.addEventListener('click', () => {
                        openProfileDialog(contact.id);
                    });
                });
            } else {
                contactsGrid.style.display = 'none';
                contactsList.style.display = 'flex';
                
                sortedContacts.forEach(contact => {
                    const contactRow = document.createElement('div');
                    contactRow.className = 'contact-row';
                    contactRow.dataset.id = contact.id;
                    contactRow.innerHTML = `
                        <img src="${contact.avatar}" alt="${contact.name}" class="contact-avatar">
                        <div class="contact-info">
                            <div class="contact-name">${contact.name}</div>
                            <div class="contact-email">${contact.email}</div>
                        </div>
                        <div class="contact-phone">${contact.phone}</div>
                    `;
                    contactsList.appendChild(contactRow);

                    // Add click event to open profile dialog
                    contactRow.addEventListener('click', () => {
                        openProfileDialog(contact.id);
                    });
                });
            }
        }

        // Update navigation tabs
        function updateNavTabs() {
            const navTabsContainer = document.getElementById('navTabs');
            navTabsContainer.innerHTML = '';
            
            groups.forEach(group => {
                const tabElement = document.createElement('div');
                tabElement.className = 'nav-tab';
                if (currentFilter === group.id) {
                    tabElement.classList.add('active');
                }
                tabElement.dataset.category = group.id;
                
                if (group.id === 'todos') {
                    tabElement.textContent = 'Todos';
                } else {
                    tabElement.innerHTML = `
                        ${group.name}
                        <div class="edit-group-btn" data-group="${group.id}">⚙️</div>
                    `;
                    
                    // Add event listener to edit group button
                    setTimeout(() => {
                        const editBtn = tabElement.querySelector('.edit-group-btn');
                        if (editBtn) {
                            editBtn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                openGroupDialog(group.id);
                            });
                        }
                    }, 0);
                }
                
                // Add event listener to tab
                tabElement.addEventListener('click', () => {
                    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                    tabElement.classList.add('active');
                    currentFilter = group.id;
                    generateContacts();
                });
                
                navTabsContainer.appendChild(tabElement);
            });
        }

        // Open message dialog
        function openMessageDialog(contactId) {
            const contact = contacts.find(c => c.id === contactId);
            if (contact) {
                currentContactId = contactId;
                document.getElementById('messageRecipient').textContent = `Para: ${contact.name} (${contact.phone})`;
                document.getElementById('messageText').value = '';
                setDefaultDateTime();
                messageDialog.style.display = 'flex';
            }
        }

        // Open profile dialog
        function openProfileDialog(contactId) {
            updateCategorySelect();
            
            let contact;
            
            if (contactId) {
                contact = contacts.find(c => c.id === contactId);
                currentContactId = contactId;
            } else {
                // New contact
                contact = {
                    id: null,
                    name: '',
                    phone: '',
                    email: '',
                    avatar: DEFAULT_AVATAR,
                    category: currentFilter === 'todos' ? 'outros' : currentFilter,
                    date: new Date()
                };
                currentContactId = null;
            }

            document.getElementById('profileName').value = contact.name;
            document.getElementById('profilePhone').value = contact.phone;
            document.getElementById('profileEmail').value = contact.email;
            document.getElementById('profileCategory').value = contact.category;
            document.getElementById('profileAvatar').src = contact.avatar;
            
            profileDialog.style.display = 'flex';
        }

        // Open group dialog
        function openGroupDialog(groupId = null) {
            const groupDialogTitle = document.getElementById('groupDialogTitle');
            const groupName = document.getElementById('groupName');
            const groupMembersList = document.getElementById('groupMembersList');
            const deleteGroupBtn = document.getElementById('deleteGroupBtn');
            const colorOptions = document.querySelectorAll('.color-option');
            
            // Reset color selection
            colorOptions.forEach(option => option.classList.remove('selected'));
            document.querySelector('.color-option[data-color="#0078d7"]').classList.add('selected');
            
            if (groupId) {
                // Edit existing group
                currentGroupId = groupId;
                const group = groups.find(g => g.id === groupId);
                
                if (group) {
                    groupDialogTitle.textContent = 'Editar Grupo';
                    groupName.value = group.name;
                    deleteGroupBtn.style.display = 'block';
                    
                    // Select the correct color
                    const colorOption = document.querySelector(`.color-option[data-color="${group.color}"]`);
                    if (colorOption) {
                        colorOptions.forEach(opt => opt.classList.remove('selected'));
                        colorOption.classList.add('selected');
                    }
                }
            } else {
                // New group
                currentGroupId = null;
                groupDialogTitle.textContent = 'Novo Grupo';
                groupName.value = '';
                deleteGroupBtn.style.display = 'none';
            }
            
            // Generate member list
            groupMembersList.innerHTML = '';
            contacts.forEach(contact => {
                const memberItem = document.createElement('div');
                memberItem.className = 'member-item';
                
                const isInGroup = contact.category === (currentGroupId || '');
                
                memberItem.innerHTML = `
                    <input type="checkbox" class="member-checkbox" data-id="${contact.id}" ${isInGroup ? 'checked' : ''}>
                    <div class="member-name">${contact.name}</div>
                `;
                
                groupMembersList.appendChild(memberItem);
            });
            
            groupDialog.style.display = 'flex';
        }

        // Close dialogs
        function closeDialogs() {
            messageDialog.style.display = 'none';
            profileDialog.style.display = 'none';
            groupDialog.style.display = 'none';
        }

        // Save contact
        async function saveContact() {
            const name = document.getElementById('profileName').value.trim();
            const phone = document.getElementById('profilePhone').value.trim();
            const email = document.getElementById('profileEmail').value.trim();
            const category = document.getElementById('profileCategory').value;
            const avatar = document.getElementById('profileAvatar').src;
            
            if (!name || !phone) {
                alert('Por favor, preencha pelo menos o nome e o telefone.');
                return;
            }
            
            const contact = {
                id: currentContactId,
                name,
                phone,
                email,
                category,
                avatar,
                date: new Date()
            };
            
            let success = false;
            
            if (currentContactId) {
                // Update existing contact
                success = await updateContact(contact);
            } else {
                // Add new contact
                success = await createContact(contact);
            }
            
            if (success) {
                closeDialogs();
            }
        }

        // Save group
        async function saveGroup() {
            const groupName = document.getElementById('groupName').value.trim();
            const selectedColor = document.querySelector('.color-option.selected').dataset.color;
            
            if (!groupName) {
                alert('Por favor, digite um nome para o grupo.');
                return;
            }
            
            if (currentGroupId) {
                // Update existing group
                const index = groups.findIndex(g => g.id === currentGroupId);
                if (index !== -1) {
                    groups[index].name = groupName;
                    groups[index].color = selectedColor;
                }
            } else {
                // Create new group
                const groupId = groupName.toLowerCase().replace(/\s+/g, '-');
                
                // Check if group ID already exists
                if (groups.some(g => g.id === groupId)) {
                    alert('Já existe um grupo com este nome. Por favor, escolha outro nome.');
                    return;
                }
                
                // Add new group
                groups.push({
                    id: groupId,
                    name: groupName,
                    color: selectedColor
                });
                
                currentGroupId = groupId;
            }
            
            // Update member assignments
            const memberCheckboxes = document.querySelectorAll('.member-checkbox');
            const updatePromises = [];
            
            memberCheckboxes.forEach(checkbox => {
                const contactId = parseInt(checkbox.dataset.id);
                const contact = contacts.find(c => c.id === contactId);
                
                if (contact) {
                    const shouldBeInGroup = checkbox.checked;
                    const isInGroup = contact.category === currentGroupId;
                    
                    if (shouldBeInGroup !== isInGroup) {
                        const updatedContact = {
                            ...contact,
                            category: shouldBeInGroup ? currentGroupId : 'outros'
                        };
                        
                        updatePromises.push(updateContact(updatedContact));
                    }
                }
            });
            
            if (updatePromises.length > 0) {
                showLoading();
                try {
                    await Promise.all(updatePromises);
                } finally {
                    hideLoading();
                }
            }
            
            closeDialogs();
            updateNavTabs();
            generateContacts();
        }

        // Delete group
        async function deleteGroup() {
            if (!currentGroupId) return;
            
            if (confirm(`Tem certeza que deseja excluir o grupo "${groups.find(g => g.id === currentGroupId)?.name}"?`)) {
                // Move contacts to "outros" category
                const updatePromises = [];
                
                contacts.forEach(contact => {
                    if (contact.category === currentGroupId) {
                        const updatedContact = {
                            ...contact,
                            category: 'outros'
                        };
                        
                        updatePromises.push(updateContact(updatedContact));
                    }
                });
                
                if (updatePromises.length > 0) {
                    showLoading();
                    try {
                        await Promise.all(updatePromises);
                    } finally {
                        hideLoading();
                    }
                }
                
                // Remove group
                groups = groups.filter(g => g.id !== currentGroupId);
                
                // Update current filter if needed
                if (currentFilter === currentGroupId) {
                    currentFilter = 'todos';
                }
                
                closeDialogs();
                updateNavTabs();
                generateContacts();
            }
        }

        // Delete contact
        async function deleteContact() {
            if (currentContactId && confirm('Tem certeza que deseja excluir este contato?')) {
                const success = await deleteContactAPI(currentContactId);
                
                if (success) {
                    closeDialogs();
                }
            }
        }

        // Send message
        function sendMessage() {
            const messageText = document.getElementById('messageText').value.trim();
            const messageDate = document.getElementById('messageDate').value;
            const messageTime = document.getElementById('messageTime').value;
            
            if (!messageText) {
                alert('Por favor, escreva uma mensagem.');
                return;
            }
            
            if (!messageDate || !messageTime) {
                alert('Por favor, selecione uma data e hora para o agendamento.');
                return;
            }
            
            const contact = contacts.find(c => c.id === currentContactId);
            if (contact) {
                const scheduledDateTime = new Date(`${messageDate}T${messageTime}`);
                alert(`Mensagem agendada para ${contact.name} em ${scheduledDateTime.toLocaleString()}: ${messageText}`);
                closeDialogs();
            }
        }

        // Handle avatar upload
        async function handleAvatarUpload(event) {
            const file = event.target.files[0];
            if (file) {
                try {
                    // Convert image to base64
                    const base64Image = await imageToBase64(file);
                    document.getElementById('profileAvatar').src = base64Image;
                } catch (error) {
                    console.error('Erro ao converter imagem:', error);
                    alert('Não foi possível processar a imagem. Tente novamente.');
                }
            }
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            // Fetch contacts from API
            fetchContacts();
            
            // Update navigation tabs
            updateNavTabs();
            
            // Update category select
            updateCategorySelect();
            
            // Set up search functionality
            searchInput.addEventListener('input', (e) => {
                searchTerm = e.target.value;
                generateContacts();
            });
            
            // Set up sort functionality
            sortSelect.addEventListener('change', (e) => {
                currentSort = e.target.value;
                generateContacts();
            });
            
            // Set up view options
            viewOptions.forEach(option => {
                option.addEventListener('click', () => {
                    viewOptions.forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                    currentView = option.dataset.view;
                    generateContacts();
                });
            });
            
            // Set up dialog close buttons
            document.querySelectorAll('.dialog-close').forEach(btn => {
                btn.addEventListener('click', closeDialogs);
            });
            
            // Close dialog when clicking outside
            document.querySelectorAll('.dialog').forEach(dialog => {
                dialog.addEventListener('click', (e) => {
                    if (e.target === dialog) {
                        closeDialogs();
                    }
                });
            });
            
            // Set up send message button
            document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
            
            // Set up profile dialog buttons
            document.getElementById('profileMessageBtn').addEventListener('click', () => {
                const contactId = currentContactId;
                closeDialogs();
                openMessageDialog(contactId);
            });
            
            document.getElementById('profileDeleteBtn').addEventListener('click', deleteContact);
            document.getElementById('profileSaveBtn').addEventListener('click', saveContact);
            
            // Set up group dialog buttons
            document.getElementById('saveGroupBtn').addEventListener('click', saveGroup);
            document.getElementById('deleteGroupBtn').addEventListener('click', deleteGroup);
            
            // Set up color options
            document.querySelectorAll('.color-option').forEach(option => {
                option.addEventListener('click', () => {
                    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                });
            });
            
            // Set up add contact button
            addContactBtn.addEventListener('click', () => {
                openProfileDialog();
            });
            
            // Set up add group button
            addGroupBtn.addEventListener('click', () => {
                openGroupDialog();
            });
            
            // Set up email icon to open message dialog
            emailBtn.addEventListener('click', () => {
                // Open message dialog for first contact in current filter
                const firstContact = contacts.find(c => currentFilter === 'todos' || c.category === currentFilter);
                if (firstContact) {
                    openMessageDialog(firstContact.id);
                } else {
                    alert('Nenhum contato encontrado nesta categoria.');
                }
            });
            
            // Set up avatar upload
            avatarInput.addEventListener('change', handleAvatarUpload);
        });