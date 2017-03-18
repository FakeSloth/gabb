var socket = io();
var $form = document.getElementById('form');
var $usernameInput = document.getElementById('username');
var $passwordInput = document.getElementById('password');
var $registerBtn = document.getElementById('register');
var $signinBtn = document.getElementById('signin');
var $text = document.getElementById('text');
var $secret = document.getElementById('secret');

function register(e) {
  e.preventDefault();

  var request = new XMLHttpRequest();
  request.open('POST', '/register', true);
  request.setRequestHeader(
    'Content-Type',
    'application/x-www-form-urlencoded; charset=UTF-8'
  );
  var u = $usernameInput.value;
  request.onreadystatechange = function() {
    if (request.readyState == XMLHttpRequest.DONE) {
      console.log(request.responseText);
      const o = JSON.parse(request.responseText);
      socket.emit('addUser', u);
      localStorage.setItem('gabb-token', o.token);
    }
  };

  var username = 'username=' + $usernameInput.value;
  var password = 'password=' + $passwordInput.value;

  request.send(username + '&' + password);

  clearInputFields();
}

if (localStorage.getItem('gabb-token')) {
  // TODO: decode token
  socket.emit('addUser');
}

function login(e) {
  e.preventDefault();

  var u = $usernameInput.value;
  var request = new XMLHttpRequest();
  request.open('POST', '/login', true);
  request.setRequestHeader(
    'Content-Type',
    'application/x-www-form-urlencoded; charset=UTF-8'
  );
  request.onreadystatechange = function() {
    if (request.readyState == XMLHttpRequest.DONE) {
      console.log(request.responseText);
      const o = JSON.parse(request.responseText);
      localStorage.setItem('gabb-token', o.token);
      socket.emit('addUser', u);
    }
  };

  var username = 'username=' + $usernameInput.value;
  var password = 'password=' + $passwordInput.value;

  request.send(username + '&' + password);

  clearInputFields();
}

function clearInputFields() {
  $usernameInput.value = '';
  $passwordInput.value = '';
}

$form.addEventListener('submit', register);
$signinBtn.addEventListener('click', login);
$secret.addEventListener('click', () => {
  console.log('secret clicked!');
  var request = new XMLHttpRequest();
  request.open('POST', '/auth', true);
  request.setRequestHeader(
    'Content-Type',
    'application/x-www-form-urlencoded; charset=UTF-8'
  );
  request.onreadystatechange = function() {
    if (request.readyState == XMLHttpRequest.DONE) {
      socket.emit('secret');
    }
  };

  request.send('token=' + localStorage.getItem('gabb-token'));
});

socket.on('addUser', uid => $text.textContent = uid);
socket.on('secret', secret => $text.textContent = secret);
socket.on('err', err => console.log(err));
