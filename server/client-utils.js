export default  {
    writeToClient(socket, msgObj) {
        socket.write(JSON.stringify(msgObj) + '\0')
    },

    writeToClients(clients, msgObj) {
        clients.forEach(client => {
            this.writeToClient(client, msgObj)
        });
    },

    writeToClientsInRoom(clients, msgObj) {
        clients.forEach(client => {
            this.writeToClient(client, msgObj)
        });
    }
}