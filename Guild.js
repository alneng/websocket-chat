class Guild {
    constructor(serverName) {
        this.serverName = serverName;
        this.onlineUsers = [];
        this.messageHistory = [];
        this.userHistory = [];
        this.currentlyTypingUsers = [];
    }

    sortOnlineUsers() {
        this.onlineUsers = this.onlineUsers.sort();
    }

    userConnect(name) {
        if (this.onlineUsers.filter(user => user === name).length == 0) {
            this.onlineUsers.push(name);
            this.sortOnlineUsers();
        }
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

    addUniqueUser(uuid) {
        this.userHistory.push(uuid);
    }

    removeUniqueUser(uuid) {
        this.userHistory = this.userHistory.filter(user => user !== uuid);
    }

    addTypingUser(uuid) {
        this.currentlyTypingUsers.push(uuid);
        this.currentlyTypingUsers = Array.from(new Set(this.currentlyTypingUsers));
        this.currentlyTypingUsers.sort();
    }

    removeTypingUser(uuid) {
        this.currentlyTypingUsers = this.currentlyTypingUsers.filter(user => user !== uuid);
        this.currentlyTypingUsers.sort();
    }

    isUniqueUser(uuid) {
        return this.userHistory.filter(user => user === uuid).length == 0;
    }

    getTypingUsers() {
        return this.currentlyTypingUsers;
    }

    getMessageObjectById(messageId) {
        return this.messageHistory.filter(msgObject => msgObject.messageId === messageId)[0];
    }

    getOnlineUsers() {
        return this.onlineUsers;
    }

    getUniqueUsers() {
        return this.userHistory;
    }

    getMessageHistory() {
        return this.messageHistory;
    }

    clearMessageHistory() {
        this.messageHistory = [];
    }
}

module.exports = { Guild };