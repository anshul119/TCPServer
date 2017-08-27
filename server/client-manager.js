import constants from '../constants'
import ClientUtils from './client-utils'

export default class ClientManager {
    constructor() {
        this.rooms = []
    }

    addToRoom(socket) {
        if(this.rooms.length == 0) {
            socket.playerSign = 'X'
            let msgObj = {type: constants.MESSAGE, message: 'Your sign is X'}
            ClientUtils.writeToClient(socket, msgObj)
            
            
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
            let clientToBeRemoved = this.rooms[i].clients.find(client => client.id == socket.id)
            if(!!clientToBeRemoved) {
                let currentRoom = this.rooms[i]
                currentRoom.clients.splice(currentRoom.clients.indexOf(clientToBeRemoved), 1)
                if(currentRoom.clients.length == 0) {
                    this.destroyRoom(this.rooms[i].id)
                }
                break
            }
        }
    }

    destroyRoom(roomId) {
        this.rooms.splice(this.rooms.findIndex(item => roomId === item.id), 1)
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
            ClientUtils.writeToClient(socket, msgObj)

            return {isRoomFilled: constants.ROOM_FILLED, roomID: availableRoom.id}
        } else {
            let newRoom = this.createRoom()
            socket.playerSign = 'X'
            let msgObj = {type: constants.MESSAGE, message: 'Your sign is X'}
            ClientUtils.writeToClient(socket, msgObj)
            newRoom.clients.push(socket)
            this.rooms.push(newRoom)

            return {isRoomFilled: constants.ROOM_NOT_FILLED, roomID: newRoom.id}
        }
    }

    getRoomByID(roomID){
        return this.rooms.find(room => room.id == roomID)
    }

    getClientsFromRoom(roomID) {
        return this.getRoomByID(roomID).clients
    }

    getClientByPlayerSign(roomID, playerSign) {
        return this.getClientsFromRoom(roomID).find(client => client.playerSign == playerSign)
    }
}