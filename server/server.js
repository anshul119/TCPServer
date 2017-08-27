import net from 'net'
import fs from 'fs'
import config from '../config'
import gameManager from './game-manager'
import GameUtils from './game-utils'
import constants from '../constants'
import ClientUtils from './client-utils'

const TCPServer = net.createServer()
const GameManager = new gameManager()


const onConnection = client => {
    GameManager.onNewClientConnection(client)

    client.on('data', data => {
        let dataObj = JSON.parse(data)
        if(dataObj.type == constants.MOVE_MADE) {
            GameManager.onClientMoveMade(dataObj, client)
        } else {
            console.log( dataObj.toString())
        }
    })

    client.on('end', data => {
        ClientManager.removeFromRoom(client)
    })
}

const onError = err => {
    console.log('An error occured. ERRCODE: ' + err.code)
}

TCPServer.on('connection', onConnection)

TCPServer.on('error', onError)

TCPServer.listen(config.socketPort, config.socketHost, () => {
    console.log('listening on '+ TCPServer.address().address + ':' + TCPServer.address().port)
})