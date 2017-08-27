import clientManager from './client-manager.js'
import constants from '../constants'
import GameUtils from './game-utils'
import ClientUtils from './client-utils'

export default class GameManager {
    constructor() {
        this.ClientManager = new clientManager()
    }
    onNewClientConnection(client) {
        client.id = (Math.floor(Math.random() * 100) + 1)
        let roomData = this.ClientManager.addToRoom(client)
    
        if(roomData.isRoomFilled === constants.ROOM_FILLED) {
            this.startGame(roomData.roomID)
        }
    }

    startGame(roomID) {
        let msgObj = {type: constants.MESSAGE, message: GameUtils.displayBoard(this.getBoard(roomID))}
        let clients = this.ClientManager.getClientsFromRoom(roomID)
    
        ClientUtils.writeToClientsInRoom(clients, msgObj)
        GameUtils.requestMove(roomID, this.ClientManager.getClientByPlayerSign(roomID, 'X'))
    }

    onClientMoveMade(dataObj, client) {
        GameUtils.makeMove(this.getBoard(dataObj.roomID), dataObj.move, client.playerSign)
        this.play(dataObj.roomID, client.playerSign)
    }

    play(roomID, currentPlayer) {
        let msgObj = {type: constants.MESSAGE, message: GameUtils.displayBoard(this.getBoard(roomID))}
        let clients = this.ClientManager.getClientsFromRoom(roomID)
    
        ClientUtils.writeToClients(clients, msgObj)
    
        if (GameUtils.checkWinner(this.getBoard(roomID), currentPlayer) === true) {
            let msgObj = {type: constants.MESSAGE, message: 'Player '+currentPlayer+ ' won!!'}
            ClientUtils.writeToClientsInRoom(clients, msgObj)
            return;
        }
        if (GameUtils.checkTie(this.getBoard(roomID)) === true) {
            let msgObj = {type: constants.MESSAGE, message: 'It\'s a tie'}
            ClientUtils.writeToClientsInRoom(clients, msgObj)
            return;
        }
        if (currentPlayer == 'X') {
            GameUtils.requestMove(roomID, this.ClientManager.getClientByPlayerSign(roomID, 'O'))
        } else {
            GameUtils.requestMove(roomID, this.ClientManager.getClientByPlayerSign(roomID, 'X'))
        }
    }

    getBoard(roomID) {
        return this.ClientManager.getRoomByID(roomID).board
    }
}