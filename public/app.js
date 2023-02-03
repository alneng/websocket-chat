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

if (getCookie("uuid")) var _uuid = getCookie("uuid");
else {
    var _uuid = generateRandomString(8);
    setCookie("uuid", _uuid);
}

var socket = io();
socket.emit('connectToSocket', _uuid);

var messages = document.getElementById('messages');
var onlineUsers = document.getElementById('online-user-table')
var form = document.getElementById('form');
var input = document.getElementById('input');
var audio = document.createElement('audio');
audio.src = './noti-sound';
audio.type = 'audio/mpeg';
audio.volume = 0.5;

let trashIcon = document.querySelector('#trash-icon').cloneNode(true);
let editIcon = document.querySelector('#edit-icon').cloneNode(true);
document.getElementById('temp').remove();

form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value) {
        if (input.value.substring(0, 1) === '/') socket.emit('commandCreate', input.value);
        else socket.emit('messageCreate', input.value);
        input.value = '';
        socket.emit('statusUpdate', {
            'id': 'typingUserStatusUpdate',
            'objectPayload': {
                'isTyping': false
            }
        });
    }
});

let formInput = document.getElementById('input');
let timeout;
formInput.addEventListener('input', () => {
    if (formInput.value === '') {
        socket.emit('statusUpdate', {
            'id': 'typingUserStatusUpdate',
            'objectPayload': {
                'isTyping': false
            }
        });
    } else {
        socket.emit('statusUpdate', {
            'id': 'typingUserStatusUpdate',
            'objectPayload': {
                'isTyping': true
            }
        });
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            socket.emit('statusUpdate', {
                'id': 'typingUserStatusUpdate',
                'objectPayload': {
                    'isTyping': false
                }
            });
        }, 7500);
    }
});

socket.on('statusUpdate', (statusObject) => {
    /*
    statusObject = {
        'id': 'typingUserStatusUpdate',
        'objectPayload': {}
    }
    */
    if (statusObject['id'] === 'typingUserStatusUpdate') {
        if (statusObject['objectPayload']['users'].length > 0) {
            document.getElementById('typing-users').innerHTML = '';

            var plurality = (statusObject['objectPayload'].length > 1 ? 'are' : 'is');
            statusObject['objectPayload']['users'].forEach((user) => {
                document.getElementById('typing-users').innerHTML += `${user}, `
            });
            var users = document.getElementById('typing-users').innerHTML;
            document.getElementById('typing-users').innerHTML = users.substring(0, users.length - 2);
            document.getElementById('plurality').innerHTML = plurality;
            document.getElementById('typing-user-wrapper').style = 'visibility: visible;';
        } else {
            document.getElementById('typing-user-wrapper').style = 'visibility: hidden;';
        }
    }
})

socket.on('pollOnlineUsers', function (list) {
    while (onlineUsers.firstChild) onlineUsers.firstChild.remove();
    list.forEach((user) => {
        var item = document.createElement('li');
        if (user === _uuid) item.textContent = user + " (you)";
        else item.textContent = user;
        onlineUsers.appendChild(item);
    });
});

socket.on('messageCreate', function (messageObject) {
    if (document.hidden) audio.play();
    var item = document.createElement('li');
    item.innerHTML += `${messageObject['author']} [${messageObject['dateTime']}]<br>${messageObject['content']}`;
    item.dataset.messageId = messageObject['messageId'];
    if (messageObject['author'] === _uuid) {
        uniqueTrashIcon = trashIcon.cloneNode(true);
        item.insertBefore(uniqueTrashIcon, item.firstChild);
        item.firstChild.addEventListener('click', () => {
            socket.emit('commandCreate', `/del ${messageObject['messageId']}`);
        });
        // item.appendChild(editIcon);
    }
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

socket.on('messageEdit', (messageId, author, timeCreated, newContent) => {
    var item = document.querySelector(`[data-message-id="${messageId}"]`);
    item.innerHTML = `${author} [${timeCreated}] (edited)<br>${newContent}`;
});

socket.on('messageDelete', (messageId) => {
    var item = document.querySelector(`[data-message-id="${messageId}"]`);
    item.remove();
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
});