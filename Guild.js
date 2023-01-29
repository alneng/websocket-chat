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

    pushMessage(msgObject) {
        this.messageHistory.push(msgObject);
    }

    deleteMessage(messageId) {
        this.messageHistory = this.messageHistory.filter(msgObject => msgObject.messageId !== messageId);
    }

    getMessageObjectById(messageId) {
        return this.messageHistory.filter(msgObject => msgObject.messageId === messageId)[0];
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