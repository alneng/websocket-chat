const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server);

const { Guild } = require('./Guild.js');
const localizedGuild = new Guild("main");

function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// make static files available at ./file.extension
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/noti-sound', (req, res) => {
    res.set({ 'content-type': 'audio/mpeg' });
    res.sendFile(__dirname + '/public/discord_sound.mp3');
});

io.on('connection', (socket) => {
    let _user = '';

    localizedGuild.getMessageHistory().forEach((msg) => {
        socket.emit('messageCreate', msg);
    });

    socket.on('connectToSocket', (username) => {
        _user = username;
        localizedGuild.userConnect(_user);
        if (localizedGuild.isUniqueUser(_user)) localizedGuild.addUniqueUser(_user);
        io.emit('pollOnlineUsers', localizedGuild.getOnlineUsers());

        console.log(`[${new Date().toLocaleTimeString()}] ${username} connected`);
    });

    socket.on('pollOnlineUsers', () => {
        io.emit('pollOnlineUsers', localizedGuild.getOnlineUsers());
    });

    socket.on('commandCreate', (command) => {
        if (command.split(' ')[0] === '/nick' && command.split(' ')[1] && command.split(' ')[1].length > 0) {
            newUsername = command.split(' ')[1];
            localizedGuild.removeTypingUser(_user);
            if (!localizedGuild.isUniqueUser(newUsername) || newUsername.length > 20) newUsername = generateRandomString(16);

            localizedGuild.userDisconnect(_user);
            localizedGuild.removeUniqueUser(_user);
            console.log(`[${new Date().toLocaleTimeString()}] ${_user} changed their username to ${newUsername}`);

            _user = newUsername;
            localizedGuild.userConnect(_user);

            socket.emit('usernameChange', _user);
            io.emit('pollOnlineUsers', localizedGuild.getOnlineUsers());
        }
        else if (command === '/purge') {
            localizedGuild.clearMessageHistory();
            io.emit('clearMessageHistory');
            console.log(`[${new Date().toLocaleTimeString()}] ${_user} cleared the chat history`);
        }
        else if (command === '/forcerestart') {
            io.emit('forceUpdateClient');
            console.log(`[${new Date().toLocaleTimeString()}] ${_user} force restarted clients`);
        }
        else if (command === '/cmds') {
            var messageObject = {
                'messageId': 'CMD' + generateRandomString(13),
                'author': "Automated Message",
                'dateTime': new Date().toLocaleString(),
                'content': 'Commands: <br>/nick [new_username]: max 20 characters<br>/img [image_link]',
            };
            io.emit('messageCreate', messageObject);
        }
        else if (command.split(" ")[0] === '/del' && command.split(' ')[1] && command.split(' ')[1].length > 0) {
            messageId = command.split(' ')[1];
            if (localizedGuild.getMessageObjectById(messageId)['author'] === _user) {
                localizedGuild.deleteMessage(messageId);
                io.emit('messageDelete', messageId);
            }
        }
        else if (command.split(" ")[0] === '/img' && command.split(' ')[1] && command.split(' ')[1].length > 0) {
            imgLink = command.split(' ')[1];
            var messageObject = {
                'messageId': generateRandomString(16),
                'author': _user,
                'dateTime': new Date().toLocaleString(),
                'content': `<img src="${imgLink}" loading="lazy">`,
            };
            localizedGuild.pushMessage(messageObject);
            io.emit('messageCreate', messageObject);
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
            if (statusObject['objectPayload']['isTyping']) localizedGuild.addTypingUser(_user);
            else localizedGuild.removeTypingUser(_user);
            io.emit('statusUpdate', {
                'id': 'typingUserStatusUpdate',
                'objectPayload': {
                    'users': localizedGuild.getTypingUsers()
                }
            });
        }
    });

    socket.on('messageCreate', (msg) => {
        var messageObject = {
            'messageId': generateRandomString(16),
            'author': _user,
            'dateTime': new Date().toLocaleString(),
            'content': msg,
        };
        localizedGuild.pushMessage(messageObject);
        io.emit('messageCreate', messageObject);
    });

    socket.on('disconnect', () => {
        localizedGuild.userDisconnect(_user)
        socket.broadcast.emit('pollOnlineUsers', localizedGuild.getOnlineUsers());

        console.log(`[${new Date().toLocaleTimeString()}] ${_user} disconnected`);
    });
});


server.listen(3000, () => {
    console.log('listening on *:3000');
});