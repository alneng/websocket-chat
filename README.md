# Simple Chat App

Built using Express and Socket.IO

Theme inspired by [Discord](http://discord.com)

## How to Run
1. Install dependencies with `npm install`
2. Run `node index.js` to start the Express server
3. Go to http://localhost:3000/ to access the app

## Slash Commands
- `/nick [new_username]`: Changes your username to a new username
- `/purge`: Clears global chat history
- `/forcerestart`: Forces all connected clients to restart (can be used for server & client updates)
- `/cmds`: Sends an automated message in the chat with a list of public commands