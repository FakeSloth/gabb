var socket = io();

var messageSchema = schemapack.build({
  text: 'string',
  room: 'string'
});

var $roomTabs = document.querySelector('.room-tabs');
var $roomContents = document.querySelector('.room-contents');
var $messageTemplate = document.getElementById('message-template');

var state = {
  currentRoom: 'Lobby',
  rooms: {}
};

function handleChatMessageInput($input) {
  return function(e) {
    e.preventDefault();
    var value = $input.value.trim();
    if (!value) return;

    var buffer = messageSchema.encode({text: value, room: state.currentRoom});
    console.log('encoded buffer', buffer);
    socket.emit('chat message', buffer);

    $input.value = '';
  }
}

$roomTabs.addEventListener('click', function(e) {
  var currentRoom = e.target.getAttribute('room');
  var room = state.rooms[currentRoom];
  room.tab.classList.add('selected');
  console.log(room.content);
  room.content.classList.remove('hidden');

  state.currentRoom = currentRoom;

  var rooms = Object.keys(state.rooms)
    .filter(function (room) { return room !== currentRoom });

  for (var i = 0; i < rooms.length; i++) {
    var r = state.rooms[rooms[i]];
    r.tab.classList.remove('selected');
    r.content.classList.add('hidden');
  }

  // note add server side join room functionality and move this function to support command /join
});

function createRoom(room) {
  var $roomTab = document.createElement('a');
  $roomTab.setAttribute('room', room);
  $roomTab.classList.add('room-tab');
  $roomTab.href = '#';
  $roomTab.textContent = room;
  $roomTabs.appendChild($roomTab);

  var $roomContent = document.createElement('div');
  $roomContent.classList.add('hidden', 'room-content-' + room);
  $roomContent.innerHTML = $messageTemplate.innerHTML.replace(/\{name\}/g, room);
  var $form = $roomContent.querySelector('.message-form');
  var $input = $roomContent.querySelector('.message-input');
  $form.addEventListener('submit', handleChatMessageInput($input));
  $roomContents.appendChild($roomContent);

  state.rooms[room] = {tab: $roomTab, content: $roomContent};
}

socket.on('rooms', function(rooms) {
  for (var i = 0; i < rooms.length; i++) {
    createRoom(rooms[i]);
  }
});

socket.on('chat message', function(buffer) {
  var messageObject = messageSchema.decode(buffer);
  console.log('message object', messageObject);

  var message = document.createElement('div');
  message.textContent = messageObject.text;

  var messages = state.rooms[messageObject.room].content
    .querySelector('.messages');
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
});
