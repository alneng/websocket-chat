class Guild {
    constructor(serverName) {
        this.serverName = serverName;
        this.onlineUsers = [];
        this.messageHistory = [];
    }

    sortOnlineUsers() {
        this.onlineUsers = this.onlineUsers.sort();
    }

    userConnect(name) {
        this.onlineUsers.push(name);
        this.sortOnlineUsers();
    }

    userDisconnect(name) {
        this.onlineUsers = this.onlineUsers.filter(user => user !== name);
        this.sortOnlineUsers();
    }

    pushMessage(msg) {
        this.messageHistory.push(msg);
    }

    getOnlineUsers() {
        return this.onlineUsers;
    }

    getMessageHistory() {
        return this.messageHistory;
    }

    clearMessageHistory() {
        this.messageHistory = [];
    }
}

module.exports = { Guild };