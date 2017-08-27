import net from 'net'
import fs from 'fs'
import config from '../config'
import clientManager from './client-manager'
import GameManager from './game-manager'
import constants from '../constants'
import ClientUtils from './client-utils'

// const unixServer = net.createServer()
const TCPServer = net.createServer()
const ClientManager = new clientManager()


const onConnection = client => {
    client.id = (Math.floor(Math.random() * 100) + 1)
    let roomData = ClientManager.addToRoom(client)

    if(roomData.isRoomFilled === constants.ROOM_FILLED) {
        startGame(roomData.roomID)
    }

    client.on('data', data => {
        let dataObj = JSON.parse(data)
        if(dataObj.type == constants.MOVE_MADE) {
            GameManager.makeMove(getBoard(dataObj.roomID), dataObj.move, client.playerSign)
            play(dataObj.roomID, client.playerSign)
        } else {
            console.log( dataObj.toString())
        }

    })

    client.on('end', data => {
        ClientManager.removeFromRoom(client)
    })
}

const startGame = roomID => {
    let msgObj = {type: constants.MESSAGE, message: GameManager.displayBoard(getBoard(roomID))}
    let clients = ClientManager.getClientsFromRoom(roomID)

    ClientUtils.writeToClientsInRoom(clients, msgObj)
    GameManager.requestMove(roomID, ClientManager.getClientByPlayerSign(roomID, 'X'))
}

const getBoard = roomID => {
    return ClientManager.getRoomByID(roomID).board
}

const play = (roomID, currentPlayer) => {
    let msgObj = {type: constants.MESSAGE, message: GameManager.displayBoard(getBoard(roomID))}
    let clients = ClientManager.getClientsFromRoom(roomID)

    ClientUtils.writeToClients(clients, msgObj)

    if (GameManager.checkWinner(getBoard(roomID), currentPlayer) === true) {
        let msgObj = {type: constants.MESSAGE, message: 'Player '+currentPlayer+ ' won!!'}
        ClientUtils.writeToClientsInRoom(clients, msgObj)
        return;
    }
    if (GameManager.checkTie(getBoard(roomID)) === true) {
        let msgObj = {type: constants.MESSAGE, message: 'It\'s a tie'}
        ClientUtils.writeToClientsInRoom(clients, msgObj)
        return;
    }
    if (currentPlayer == 'X') {
        GameManager.requestMove(roomID, ClientManager.getClientByPlayerSign(roomID, 'O'))
    } else {
        GameManager.requestMove(roomID, ClientManager.getClientByPlayerSign(roomID, 'X'))
    }
}

const onError = err => {
    console.log('An error occured. ERRCODE: ' + err.code)
}

TCPServer.on('connection', onConnection)

// unixServer.on('connection', onConnection)

TCPServer.on('error', onError)

TCPServer.listen(config.socketPort, config.socketHost, () => {
    console.log('listening on '+ TCPServer.address().address + ':' + TCPServer.address().port)
})

// unixServer.on('error', onnError)

// unixServer.listen(config.socketPath, () => {
//     console.log('listening on ', unixServer.address())
// })

// process.on('SIGINT', () => {
//     unixServer.close(() => {
//         process.exit(0)
//     })
// })