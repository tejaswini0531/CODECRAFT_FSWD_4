const socket = io();

const clientsTotal = document.getElementById('clien-total');
const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage();
});

// Receive the total number of clients connected
socket.on('clients-total', (data) => {
  clientsTotal.innerText = `Total Clients : ${data}`;
});

// Send message when the form is submitted
function sendMessage() {
  if (messageInput.value === '') return;

  const data = {
    name: nameInput.value,
    message: messageInput.value,
    dateTime: new Date(),
  };

  socket.emit('message', data);  // Emit message to the server
  addMessageToUI(true, data);  // Display message on the sender's side
  messageInput.value = '';
}

// Receive the message from other clients and add it to the UI
socket.on('chat-message', (data) => {
  addMessageToUI(false, data);  // Display message on the receiver's side
});

// Display messages on the UI
function addMessageToUI(isOwnMessage, data) {
  clearFeedback();
  const element = `
    <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
      <p class="message">
        ${data.message}
        <span>${data.name} ⚪ ${moment(data.dateTime).fromNow()}</span>
      </p>
    </li>`;
  
  messageContainer.innerHTML += element;
  scrollToBottom();
}

// Scroll to the bottom of the message container
function scrollToBottom() {
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Typing feedback events
messageInput.addEventListener('focus', (e) => {
  socket.emit('fffeedback', {
    feedback: `✍️${nameInput.value} is typing a message`,
  });
});

messageInput.addEventListener('keypress', (e) => {
  socket.emit('feedback', {
    feedback: `✍️${nameInput.value} is typing a message`,
  });
});

messageInput.addEventListener('blur', (e) => {
  socket.emit('feedback', { feedback: '' });
});

// Handle feedback message display
socket.on('feedback', (data) => {
  clearFeedback();
  const element = `
    <li class="message-feedback">
      <p class="feedback" id="feedback">${data.feedback}</p>
    </li>`;
  
  messageContainer.innerHTML += element;
});

function clearFeedback() {
  document.querySelectorAll('li.message-feedback').forEach((element) => {
    element.parentNode.removeChild(element);
  });
}
