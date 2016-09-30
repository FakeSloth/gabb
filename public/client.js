var socket = io();

var messageSchema = schemapack.build({
  text: 'string'
});

var messages = document.querySelector('.messages');
var messageForm = document.querySelector('.message-form');
var messageInput = document.querySelector('.message-input');

socket.on('chat message', function(buffer) {
  const messageObject = messageSchema.decode(buffer);
  console.log('message object', messageObject);

  const message = document.createElement('div');
  message.innerHTML = messageObject.text;

  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
});

messageForm.addEventListener('submit', function(e) {
  e.preventDefault();
  var value = messageInput.value.trim();
  if (!value) return;

  const buffer = messageSchema.encode({text: value});
  console.log('encoded buffer', buffer);
  socket.emit('chat message', buffer);

  messageInput.value = '';
});
