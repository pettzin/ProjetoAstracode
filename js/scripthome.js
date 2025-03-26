const API = {
  BASE_URL: 'http://localhost:3000',
  ENDPOINTS: {
      SELECT: '/api/select',
      INSERT: '/api/insert',
      UPDATE: id => `/api/update/${id}`,
      DELETE: id => `/api/delete/${id}`
  }
};

const DEFAULT_AVATAR = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/iconContact-EjbTyLvYNWCnsYPredBV9eV4PVozhW.png';

// ===== STATE =====
const state = {
  contacts: [],
  groups: [
      { id: 'familia', name: 'Família', color: '#0078d7' },
      { id: 'alunos', name: 'Alunos', color: '#0078d7' },
      { id: 'trabalho', name: 'Trabalho', color: '#0078d7' },
      { id: 'amigos', name: 'Amigos', color: '#0078d7' },
      { id: 'outros', name: 'Outros', color: '#0078d7' },
      { id: 'todos', name: 'Todos', color: '#0078d7' }
  ],
  filter: {
      category: 'todos',
      searchTerm: '',
      sort: 'name',
      view: 'grid'
  },
  currentContactId: null,
  currentGroupId: null
};

// ===== DOM ELEMENTS =====
const elements = {
  contactsGrid: document.getElementById('contactsGrid'),
  contactsList: document.getElementById('contactsList'),
  searchInput: document.getElementById('searchInput'),
  sortSelect: document.getElementById('sortSelect'),
  viewOptions: document.querySelectorAll('.view-option'),
  dialogs: {
      message: document.getElementById('messageDialog'),
      profile: document.getElementById('profileDialog'),
      group: document.getElementById('groupDialog')
  },
  buttons: {
      addContact: document.getElementById('addContactBtn'),
      addGroup: document.getElementById('addGroupBtn'),
      email: document.getElementById('emailBtn'),
      sendMessage: document.getElementById('sendMessageBtn'),
      profileMessage: document.getElementById('profileMessageBtn'),
      profileDelete: document.getElementById('profileDeleteBtn'),
      profileSave: document.getElementById('profileSaveBtn'),
      saveGroup: document.getElementById('saveGroupBtn'),
      deleteGroup: document.getElementById('deleteGroupBtn')
  },
  inputs: {
      avatar: document.getElementById('avatarInput'),
      profileCategory: document.getElementById('profileCategory')
  },
  loading: document.getElementById('loadingSpinner'),
  navTabs: document.getElementById('navTabs')
};

// ===== UTILITY FUNCTIONS =====

/**
* Shows the loading spinner
*/
const showLoading = () => {
  elements.loading.style.display = 'flex';
};

/**
* Hides the loading spinner
*/
const hideLoading = () => {
  elements.loading.style.display = 'none';
};

/**
* Converts an image file to base64
* @param {File} file - The image file to convert
* @returns {Promise<string>} - Promise resolving to base64 string
*/
const imageToBase64 = file => {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
  });
};

/**
* Formats a date to YYYY-MM-DD
* @param {Date} date - The date to format
* @returns {string} - Formatted date string
*/
const formatDate = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
* Formats a time to HH:MM
* @param {Date} date - The date to extract time from
* @returns {string} - Formatted time string
*/
const formatTime = date => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
* Sets the default date and time for message scheduling
*/
const setDefaultDateTime = () => {
  const now = new Date();
  const dateInput = document.getElementById('messageDate');
  const timeInput = document.getElementById('messageTime');
  
  dateInput.value = formatDate(now);
  timeInput.value = formatTime(now);
};

/**
* Closes all dialogs
*/
const closeDialogs = () => {
  Object.values(elements.dialogs).forEach(dialog => {
      dialog.style.display = 'none';
  });
};

// ===== API FUNCTIONS =====

/**
* Fetches all contacts from the API
*/
const fetchContacts = async () => {
  showLoading();
  try {
      const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.SELECT}`);
      if (!response.ok) {
          throw new Error('Error fetching contacts');
      }
      const data = await response.json();
      
      // Transform API data to our format
      state.contacts = data.map(contact => ({
          id: contact.id,
          name: contact.nome,
          phone: contact.telefone,
          email: contact.email,
          avatar: contact.imagem || DEFAULT_AVATAR,
          category: contact.grupo || 'outros',
          date: new Date(contact.data_criacao || Date.now())
      }));
      
      renderContacts();
  } catch (error) {
      console.error('Error fetching contacts:', error);
      alert('Could not load contacts. Please check your server connection.');
  } finally {
      hideLoading();
  }
};

/**
* Creates a new contact via API
* @param {Object} contact - The contact to create
* @returns {Promise<boolean>} - Success status
*/
const createContact = async contact => {
  showLoading();
  try {
      // Create the request body without the image field to avoid the database error
      const requestBody = {
          nome: contact.name,
          email: contact.email,
          telefone: contact.phone,
          grupo: contact.category
          // 'imagem' field is removed since it doesn't exist in the database
      };
      
      const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.INSERT}`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
          throw new Error('Error creating contact');
      }
      
      await fetchContacts();
      return true;
  } catch (error) {
      console.error('Error creating contact:', error);
      alert('Could not create contact. Please check your server connection.');
      return false;
  } finally {
      hideLoading();
  }
};

/**
* Updates an existing contact via API
* @param {Object} contact - The contact to update
* @returns {Promise<boolean>} - Success status
*/
const updateContact = async contact => {
  showLoading();
  try {
      // Create the request body without the image field to avoid the database error
      const requestBody = {
          nome: contact.name,
          email: contact.email,
          telefone: contact.phone,
          grupo: contact.category
          // 'imagem' field is removed since it doesn't exist in the database
      };
      
      const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.UPDATE(contact.id)}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
          throw new Error('Error updating contact');
      }
      
      await fetchContacts();
      return true;
  } catch (error) {
      console.error('Error updating contact:', error);
      alert('Could not update contact. Please check your server connection.');
      return false;
  } finally {
      hideLoading();
  }
};

/**
* Deletes a contact via API
* @param {number} contactId - The ID of the contact to delete
* @returns {Promise<boolean>} - Success status
*/
const deleteContactAPI = async contactId => {
  showLoading();
  try {
      const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.DELETE(contactId)}`, {
          method: 'DELETE'
      });
      
      if (!response.ok) {
          throw new Error('Error deleting contact');
      }
      
      await fetchContacts();
      return true;
  } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Could not delete contact. Please check your server connection.');
      return false;
  } finally {
      hideLoading();
  }
};

// ===== RENDERING FUNCTIONS =====

/**
* Updates the category select options in the profile dialog
*/
const updateCategorySelect = () => {
  elements.inputs.profileCategory.innerHTML = '';
  state.groups.forEach(group => {
      if (group.id !== 'todos') {
          const option = document.createElement('option');
          option.value = group.id;
          option.textContent = group.name;
          elements.inputs.profileCategory.appendChild(option);
      }
  });
};

/**
* Sorts contacts based on current sort setting
* @param {Array} contacts - The contacts to sort
* @returns {Array} - Sorted contacts
*/
const sortContacts = contacts => {
  const sortedContacts = [...contacts];
  
  switch (state.filter.sort) {
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
};

/**
* Renders contacts based on current filter, search, and sort settings
*/
const renderContacts = () => {
  // Filter contacts based on category and search term
  const filteredContacts = state.contacts.filter(contact => {
      const matchesCategory = state.filter.category === 'todos' || contact.category === state.filter.category;
      const matchesSearch = state.filter.searchTerm === '' || 
          contact.name.toLowerCase().includes(state.filter.searchTerm.toLowerCase()) ||
          contact.phone.includes(state.filter.searchTerm);
      return matchesCategory && matchesSearch;
  });
  
  // Sort contacts
  const sortedContacts = sortContacts(filteredContacts);
  
  // Clear both containers
  elements.contactsGrid.innerHTML = '';
  elements.contactsList.innerHTML = '';
  
  // Generate contacts based on current view
  if (state.filter.view === 'grid') {
      elements.contactsGrid.style.display = 'grid';
      elements.contactsList.style.display = 'none';
      
      sortedContacts.forEach(contact => {
          const contactCard = document.createElement('div');
          contactCard.className = 'contact-card';
          contactCard.dataset.id = contact.id;
          contactCard.innerHTML = `
              <img src="${contact.avatar}" alt="${contact.name}" class="contact-avatar">
              <div class="contact-name">${contact.name}</div>
              <div class="contact-phone">${contact.phone}</div>
          `;
          elements.contactsGrid.appendChild(contactCard);

          // Add click event to open profile dialog
          contactCard.addEventListener('click', () => {
              openProfileDialog(contact.id);
          });
      });
  } else {
      elements.contactsGrid.style.display = 'none';
      elements.contactsList.style.display = 'flex';
      
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
          elements.contactsList.appendChild(contactRow);

          // Add click event to open profile dialog
          contactRow.addEventListener('click', () => {
              openProfileDialog(contact.id);
          });
      });
  }
};

/**
* Updates navigation tabs based on current groups
*/
const updateNavTabs = () => {
  elements.navTabs.innerHTML = '';
  
  state.groups.forEach(group => {
      const tabElement = document.createElement('div');
      tabElement.className = 'nav-tab';
      if (state.filter.category === group.id) {
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
          state.filter.category = group.id;
          renderContacts();
      });
      
      elements.navTabs.appendChild(tabElement);
  });
};

// ===== DIALOG FUNCTIONS =====

/**
* Opens the message dialog for a specific contact
* @param {number} contactId - The ID of the contact
*/
const openMessageDialog = contactId => {
  const contact = state.contacts.find(c => c.id === contactId);
  if (contact) {
      state.currentContactId = contactId;
      document.getElementById('messageRecipient').textContent = `Para: ${contact.name} (${contact.phone})`;
      document.getElementById('messageText').value = '';
      setDefaultDateTime();
      elements.dialogs.message.style.display = 'flex';
  }
};

/**
* Opens the profile dialog for creating or editing a contact
* @param {number|null} contactId - The ID of the contact to edit, or null for a new contact
*/
const openProfileDialog = contactId => {
  updateCategorySelect();
  
  let contact;
  
  if (contactId) {
      contact = state.contacts.find(c => c.id === contactId);
      state.currentContactId = contactId;
  } else {
      // New contact
      contact = {
          id: null,
          name: '',
          phone: '',
          email: '',
          avatar: DEFAULT_AVATAR,
          category: state.filter.category === 'todos' ? 'outros' : state.filter.category,
          date: new Date()
      };
      state.currentContactId = null;
  }

  document.getElementById('profileName').value = contact.name;
  document.getElementById('profilePhone').value = contact.phone;
  document.getElementById('profileEmail').value = contact.email;
  document.getElementById('profileCategory').value = contact.category;
  document.getElementById('profileAvatar').src = contact.avatar;
  
  elements.dialogs.profile.style.display = 'flex';
};

/**
* Opens the group dialog for creating or editing a group
* @param {string|null} groupId - The ID of the group to edit, or null for a new group
*/
const openGroupDialog = (groupId = null) => {
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
      state.currentGroupId = groupId;
      const group = state.groups.find(g => g.id === groupId);
      
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
      state.currentGroupId = null;
      groupDialogTitle.textContent = 'Novo Grupo';
      groupName.value = '';
      deleteGroupBtn.style.display = 'none';
  }
  
  // Generate member list
  groupMembersList.innerHTML = '';
  state.contacts.forEach(contact => {
      const memberItem = document.createElement('div');
      memberItem.className = 'member-item';
      
      const isInGroup = contact.category === (state.currentGroupId || '');
      
      memberItem.innerHTML = `
          <input type="checkbox" class="member-checkbox" data-id="${contact.id}" ${isInGroup ? 'checked' : ''}>
          <div class="member-name">${contact.name}</div>
      `;
      
      groupMembersList.appendChild(memberItem);
  });
  
  elements.dialogs.group.style.display = 'flex';
};

// ===== ACTION FUNCTIONS =====

/**
* Saves the current contact (creates or updates)
*/
const saveContact = async () => {
  const name = document.getElementById('profileName').value.trim();
  const phone = document.getElementById('profilePhone').value.trim();
  const email = document.getElementById('profileEmail').value.trim();
  const category = document.getElementById('profileCategory').value;
  const avatar = document.getElementById('profileAvatar').src;
  
  if (!name || !phone) {
      alert('Please fill in at least the name and phone number.');
      return;
  }
  
  const contact = {
      id: state.currentContactId,
      name,
      phone,
      email,
      category,
      avatar,
      date: new Date()
  };
  
  let success = false;
  
  if (state.currentContactId) {
      // Update existing contact
      success = await updateContact(contact);
  } else {
      // Add new contact
      success = await createContact(contact);
  }
  
  if (success) {
      closeDialogs();
  }
};

/**
* Saves the current group (creates or updates)
*/
const saveGroup = async () => {
  const groupName = document.getElementById('groupName').value.trim();
  const selectedColor = document.querySelector('.color-option.selected').dataset.color;
  
  if (!groupName) {
      alert('Please enter a name for the group.');
      return;
  }
  
  if (state.currentGroupId) {
      // Update existing group
      const index = state.groups.findIndex(g => g.id === state.currentGroupId);
      if (index !== -1) {
          state.groups[index].name = groupName;
          state.groups[index].color = selectedColor;
      }
  } else {
      // Create new group
      const groupId = groupName.toLowerCase().replace(/\s+/g, '-');
      
      // Check if group ID already exists
      if (state.groups.some(g => g.id === groupId)) {
          alert('A group with this name already exists. Please choose another name.');
          return;
      }
      
      // Add new group
      state.groups.push({
          id: groupId,
          name: groupName,
          color: selectedColor
      });
      
      state.currentGroupId = groupId;
  }
  
  // Update member assignments
  const memberCheckboxes = document.querySelectorAll('.member-checkbox');
  const updatePromises = [];
  
  memberCheckboxes.forEach(checkbox => {
      const contactId = parseInt(checkbox.dataset.id);
      const contact = state.contacts.find(c => c.id === contactId);
      
      if (contact) {
          const shouldBeInGroup = checkbox.checked;
          const isInGroup = contact.category === state.currentGroupId;
          
          if (shouldBeInGroup !== isInGroup) {
              const updatedContact = {
                  ...contact,
                  category: shouldBeInGroup ? state.currentGroupId : 'outros'
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
  renderContacts();
};

/**
* Deletes the current group
*/
const deleteGroup = async () => {
  if (!state.currentGroupId) return;
  
  if (confirm(`Are you sure you want to delete the group "${state.groups.find(g => g.id === state.currentGroupId)?.name}"?`)) {
      // Move contacts to "outros" category
      const updatePromises = [];
      
      state.contacts.forEach(contact => {
          if (contact.category === state.currentGroupId) {
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
      state.groups = state.groups.filter(g => g.id !== state.currentGroupId);
      
      // Update current filter if needed
      if (state.filter.category === state.currentGroupId) {
          state.filter.category = 'todos';
      }
      
      closeDialogs();
      updateNavTabs();
      renderContacts();
  }
};

/**
* Deletes the current contact
*/
const deleteContact = async () => {
  if (state.currentContactId && confirm('Are you sure you want to delete this contact?')) {
      const success = await deleteContactAPI(state.currentContactId);
      
      if (success) {
          closeDialogs();
      }
  }
};

/**
* Sends a message to the current contact
*/
const sendMessage = () => {
  const messageText = document.getElementById('messageText').value.trim();
  const messageDate = document.getElementById('messageDate').value;
  const messageTime = document.getElementById('messageTime').value;
  
  if (!messageText) {
      alert('Please write a message.');
      return;
  }
  
  if (!messageDate || !messageTime) {
      alert('Please select a date and time for scheduling.');
      return;
  }
  
  const contact = state.contacts.find(c => c.id === state.currentContactId);
  if (contact) {
      const scheduledDateTime = new Date(`${messageDate}T${messageTime}`);
      alert(`Message scheduled for ${contact.name} at ${scheduledDateTime.toLocaleString()}: ${messageText}`);
      closeDialogs();
  }
};

/**
* Handles avatar upload
* @param {Event} event - The change event
*/
const handleAvatarUpload = async event => {
  const file = event.target.files[0];
  if (file) {
      try {
          // Convert image to base64
          const base64Image = await imageToBase64(file);
          document.getElementById('profileAvatar').src = base64Image;
      } catch (error) {
          console.error('Error converting image:', error);
          alert('Could not process the image. Please try again.');
      }
  }
};

// ===== EVENT LISTENERS =====

/**
* Sets up all event listeners
*/
const setupEventListeners = () => {
  // Search functionality
  elements.searchInput.addEventListener('input', e => {
      state.filter.searchTerm = e.target.value;
      renderContacts();
  });
  
  // Sort functionality
  elements.sortSelect.addEventListener('change', e => {
      state.filter.sort = e.target.value;
      renderContacts();
  });
  
  // View options
  elements.viewOptions.forEach(option => {
      option.addEventListener('click', () => {
          elements.viewOptions.forEach(opt => opt.classList.remove('active'));
          option.classList.add('active');
          state.filter.view = option.dataset.view;
          renderContacts();
      });
  });
  
  // Dialog close buttons
  document.querySelectorAll('.dialog-close').forEach(btn => {
      btn.addEventListener('click', closeDialogs);
  });
  
  // Close dialog when clicking outside
  Object.values(elements.dialogs).forEach(dialog => {
      dialog.addEventListener('click', e => {
          if (e.target === dialog) {
              closeDialogs();
          }
      });
  });
  
  // Button event listeners
  elements.buttons.sendMessage.addEventListener('click', sendMessage);
  elements.buttons.profileMessage.addEventListener('click', () => {
      const contactId = state.currentContactId;
      closeDialogs();
      openMessageDialog(contactId);
  });
  elements.buttons.profileDelete.addEventListener('click', deleteContact);
  elements.buttons.profileSave.addEventListener('click', saveContact);
  elements.buttons.saveGroup.addEventListener('click', saveGroup);
  elements.buttons.deleteGroup.addEventListener('click', deleteGroup);
  elements.buttons.addContact.addEventListener('click', () => openProfileDialog());
  elements.buttons.addGroup.addEventListener('click', () => openGroupDialog());
  elements.buttons.email.addEventListener('click', () => {
      // Open message dialog for first contact in current filter
      const firstContact = state.contacts.find(c => 
          state.filter.category === 'todos' || c.category === state.filter.category
      );
      if (firstContact) {
          openMessageDialog(firstContact.id);
      } else {
          alert('No contacts found in this category.');
      }
  });
  
  // Color options
  document.querySelectorAll('.color-option').forEach(option => {
      option.addEventListener('click', () => {
          document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
          option.classList.add('selected');
      });
  });
  
  // Avatar upload
  elements.inputs.avatar.addEventListener('change', handleAvatarUpload);
};

// ===== INITIALIZATION =====

/**
* Initializes the application
*/
const init = () => {
  // Fetch contacts from API
  fetchContacts();
  
  // Update navigation tabs
  updateNavTabs();
  
  // Update category select
  updateCategorySelect();
  
  // Set up event listeners
  setupEventListeners();
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);