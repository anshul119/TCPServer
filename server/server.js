import net from 'net'
import fs from 'fs'
import config from '../config'
import ClientManager from './client-manager'
import GameManager from './game-manager'
import constants from '../constants'

let distributor = new ClientManager()

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
let onConnection = client => {
    client.id = (Math.floor(Math.random() * 100) + 1)
    let roomData = distributor.addToRoom(client)

    if(roomData.isRoomFilled === constants.ROOM_FILLED) {
        startGame(roomData.roomID)
    }

    client.on('data', data => {
        let dataObj = JSON.parse(data)
        if(dataObj.type == constants.MOVE_MADE) {
            game.makeMove(dataObj.moveMade, client.playerSign)
            play(dataObj.roomID, client.playerSign)
        } else {
            console.log( dataObj.toString())
        }

    })

    client.on('end', data => {
        distributor.removeFromRoom(client)
    })
}

let startGame = roomID => {
    global.game = new GameManager()

    let msgObj = {type: constants.MESSAGE, message: game.displayBoard()}
    distributor.writeToClientsInRoom(roomID, msgObj)
    requestMove(roomID, distributor.getClientByPlayerSign(roomID, 'X'))
}

let requestMove = (roomID, client) => {
    let msgObj = {type: constants.MAKE_MOVE, roomID: roomID}
    distributor.writeToClient(client, msgObj)
}

let play = (roomID, currentPlayer) => {
    let msgObj = {type: constants.MESSAGE, message: game.displayBoard()}
    distributor.writeToClientsInRoom(roomID, msgObj)

    if (game.checkWinner(currentPlayer) === true) {
        let msgObj = {type: constants.MESSAGE, message: 'Player '+currentPlayer+ ' won!!'}
        distributor.writeToClientsInRoom(roomID, msgObj)
        return;
    }
    if (game.checkTie() === true) {
        let msgObj = {type: constants.MESSAGE, message: 'It\'s a tie'}
        distributor.writeToClientsInRoom(roomID, msgObj)
        return;
    }
    if (currentPlayer == 'X') {
        requestMove(roomID, distributor.getClientByPlayerSign(roomID, 'O'))
    } else {
        requestMove(roomID, distributor.getClientByPlayerSign(roomID, 'X'))
    }
}

let onError = err => {
    console.log('An error occured. ERRCODE: ' + err.code)
}

// process.on('SIGINT', () => {
//     unixServer.close(() => {
//         process.exit(0)
//     })
// })