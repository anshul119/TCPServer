import net from 'net'
import fs from 'fs'
import config from '../config'
import ClientManager from './client-manager'
import gameManager from './game-manager'
import constants from '../constants'

gameManager.winningCombinations = [0];

const clientManager = new ClientManager()

// const unixServer = net.createServer()
const TCPServer = net.createServer()

TCPServer.on('connection', (client) => {
    onConnection(client)
})

// unixServer.on('connection', (client) => {
//     onConnection(client)
// })

TCPServer.on('error', e => {
    onError(e)
})

// unixServer.on('error', e => {
//     onError(e)
// })

// unixServer.listen(config.socketPath, () => {
//     console.log('listening on ', unixServer.address())
// })

TCPServer.listen(config.socketPort, config.socketHost, () => {
    console.log('listening on '+ TCPServer.address().address + ':' + TCPServer.address().port)
})

/**
 * 
 * @param {net.Socket} client 
 */
const onConnection = client => {
    client.id = (Math.floor(Math.random() * 100) + 1)
    let roomData = clientManager.addToRoom(client)

    if(roomData.isRoomFilled === constants.ROOM_FILLED) {
        startGame(roomData.roomID)
    }

    client.on('data', data => {
        let dataObj = JSON.parse(data)
        if(dataObj.type == constants.MOVE_MADE) {
            gameManager.makeMove(getBoard(dataObj.roomID), dataObj.move, client.playerSign)
            play(dataObj.roomID, client.playerSign)
        } else {
            console.log( dataObj.toString())
        }

    })

    client.on('end', data => {
        clientManager.removeFromRoom(client)
    })
}

const startGame = roomID => {
    let msgObj = {type: constants.MESSAGE, message: gameManager.displayBoard(getBoard(roomID))}
    clientManager.writeToClientsInRoom(roomID, msgObj)
    requestMove(roomID, clientManager.getClientByPlayerSign(roomID, 'X'))
}

const requestMove = (roomID, client) => {
    let msgObj = {type: constants.MAKE_MOVE, roomID: roomID}
    clientManager.writeToClient(client, msgObj)
}

const getBoard = roomID => {
    return clientManager.getRoomByID(roomID).board
}

const play = (roomID, currentPlayer) => {
    let msgObj = {type: constants.MESSAGE, message: gameManager.displayBoard(getBoard(roomID))}
    clientManager.writeToClientsInRoom(roomID, msgObj)

    if (gameManager.checkWinner(getBoard(roomID), currentPlayer) === true) {
        let msgObj = {type: constants.MESSAGE, message: 'Player '+currentPlayer+ ' won!!'}
        clientManager.writeToClientsInRoom(roomID, msgObj)
        return;
    }
    if (gameManager.checkTie(getBoard(roomID)) === true) {
        let msgObj = {type: constants.MESSAGE, message: 'It\'s a tie'}
        clientManager.writeToClientsInRoom(roomID, msgObj)
        return;
    }
    if (currentPlayer == 'X') {
        requestMove(roomID, clientManager.getClientByPlayerSign(roomID, 'O'))
    } else {
        requestMove(roomID, clientManager.getClientByPlayerSign(roomID, 'X'))
    }
}

const onError = err => {
    console.log('An error occured. ERRCODE: ' + err.code)
}

// process.on('SIGINT', () => {
//     unixServer.close(() => {
//         process.exit(0)
//     })
// })