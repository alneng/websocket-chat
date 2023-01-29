const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server);

const { Guild } = require('./Guild.js');
const localizedGuild = new Guild("main")


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
        io.emit('pollOnlineUsers', localizedGuild.getOnlineUsers());

        console.log(`[${new Date().toLocaleTimeString()}] ${username} connected`);
    });

    socket.on('pollOnlineUsers', () => {
        io.emit('pollOnlineUsers', localizedGuild.getOnlineUsers());
    })

    socket.on('messageCreate', (msg) => {
        if (msg.substring(0, 5) === '/nick') {
            newUsername = msg.substring(6, msg.length);

            localizedGuild.userDisconnect(_user);
            console.log(`[${new Date().toLocaleTimeString()}] ${_user} changed their username to ${newUsername}`);

            _user = newUsername;
            localizedGuild.userConnect(_user);

            socket.emit('usernameChange', _user);
            io.emit('pollOnlineUsers', localizedGuild.getOnlineUsers());
        }
        else if (msg === '/purge') {
            localizedGuild.clearMessageHistory();
            io.emit('clearMessageHistory');
            console.log(`[${new Date().toLocaleTimeString()}] ${_user} cleared the chat history`);
        }
        else if (msg === '/forcerestart') {
            io.emit('forceUpdateClient');
            console.log(`[${new Date().toLocaleTimeString()}] ${_user} force restarted clients`);
        }
        else if (msg === '/cmds') {
            var messageContent = `Automated Message [${new Date().toLocaleTimeString()}]<br>Commands: "/nick [new_username]"`
            io.emit('messageCreate', messageContent);
        }
        else {
            var messageContent = `${_user} [${new Date().toLocaleTimeString()}]<br>${msg}`
            localizedGuild.pushMessage(messageContent);
            io.emit('messageCreate', messageContent);
        }
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