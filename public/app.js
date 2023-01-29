function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

if (getCookie("uuid")) var _uuid = getCookie("uuid")
else {
    var _uuid = generateRandomString(8);
    setCookie("uuid", _uuid);
}

var socket = io();
socket.emit('connectToSocket', _uuid)

var messages = document.getElementById('messages');
var onlineUsers = document.getElementById('online-user-table')
var form = document.getElementById('form');
var input = document.getElementById('input');
var audio = document.createElement('audio');
audio.src = './noti-sound';
audio.type = 'audio/mpeg';
audio.volume = 0.5;

form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('messageCreate', input.value);
        input.value = '';
    }
});

socket.on('pollOnlineUsers', function (list) {
    while (onlineUsers.firstChild) onlineUsers.firstChild.remove();
    list.forEach((user) => {
        var item = document.createElement('li');
        if (user === _uuid) item.textContent = user + " (you)";
        else item.textContent = user;
        onlineUsers.appendChild(item);
    })
});

socket.on('messageCreate', function (msg) {
    if (document.hidden) audio.play();
    var item = document.createElement('li');
    item.innerHTML = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

socket.on('usernameChange', function (newName) {
    _uuid = newName;
    setCookie("uuid", newName);
});

socket.on('clearMessageHistory', () => {
    while (messages.firstChild) messages.firstChild.remove();
});

socket.on('forceUpdateClient', () => {
    window.location.href = '/';
})