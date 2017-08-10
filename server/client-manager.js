import constants from '../constants'

export default class ClientManager {
    constructor() {
        this.rooms = []
    }

    addToRoom(socket) {
        if(this.rooms.length == 0) {
            socket.playerSign = 'X'
            let msgObj = {type: constants.MESSAGE, message: 'Your sign is X'}
            this.writeToClient(socket, msgObj)
            let newRoom = this.createRoom()
            newRoom.clients.push(socket)
            this.rooms.push(newRoom)

            return {isRoomFilled: constants.ROOM_NOT_FILLED, roomID: newRoom.id}
        } else {
            return this.getFirstAvailableRoom(socket)
        }
    }

    removeFromRoom(socket) {
        for(let i = 0; i < this.rooms.length; ++i) {
            for(let j = 0; j < this.rooms[i].clients.length; ++j) {
                if(socket.id == this.rooms[i].clients[j].id) {
                    let matchedClientsArray = this.rooms[i].clients
                    matchedClientsArray.splice(matchedClientsArray.indexOf(socket), 1)
                    if (matchedClientsArray.length == 0 ) {
                        this.destroyRoom(this.rooms[i].id)
                        console.log(this.rooms)
                    }
                    break
                }
            }
        }
    }

    destroyRoom(roomId) {
        this.rooms.splice(this.rooms.findIndex(item => roomId === item.id), 1)
        this.rooms.forEach((room, i) => {
            if(roomId == room.id) this.rooms.splice(i, 1)
        })
    }

    createRoom() {
        return {
            id: (Math.floor(Math.random() * 100) + 1),
            maxClients: 2,
            clients: [],
            board: [1,2,3,4,5,6,7,8,9]
        }
    }

    getFirstAvailableRoom(socket) {
        let availableRoom = this.rooms.find(room => {
            return room.clients.length !=room.maxClients;        
        })

        if(availableRoom) {
            let msgObj

            if(availableRoom.clients[0].playerSign == 'O') {
                socket.playerSign = 'X'
                msgObj = {type: constants.MESSAGE, message: 'Your sign is X'}
            } else {
                socket.playerSign = 'O'
                msgObj = {type: constants.MESSAGE, message: 'Your sign is O'}
            }

            availableRoom.clients.push(socket)
            this.writeToClient(socket, msgObj)

            return {isRoomFilled: constants.ROOM_FILLED, roomID: availableRoom.id}
        } else {
            let newRoom = this.createRoom()
            socket.playerSign = 'X'
            let msgObj = {type: constants.MESSAGE, message: 'Your sign is X'}
            this.writeToClient(socket, msgObj)
            newRoom.clients.push(socket)
            this.rooms.push(newRoom)

            return {isRoomFilled: constants.ROOM_NOT_FILLED, roomID: newRoom.id}
        }
    }

    writeToClient(socket, msgObj) {
        socket.write(JSON.stringify(msgObj) + '\0')
    }

    getRoomByID(roomID){
        return this.rooms.find(room => room.id == roomID)
    }

    getClientsFromRoom(roomID) {
        return this.getRoomByID(roomID).clients
    }

    writeToClientsInRoom(roomID, msgObj) {
        this.getClientsFromRoom(roomID).forEach(client => {
            this.writeToClient(client, msgObj)
        });
    }

    getClientByPlayerSign(roomID, playerSign) {
        return this.getClientsFromRoom(roomID).find(client => client.playerSign == playerSign)
    }
}