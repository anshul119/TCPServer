import net from 'net'
import readline from 'readline'
import config from '../config.js'
import constants from '../constants.js'

const client = new net.Socket()

client.connect(config.socketPort, config.socketHost, () => {
    console.log('connected to server.')
})


let buffer = [];
const processChunk = data => {

    if (data.indexOf('\0') >= 0) {
        const part = data.toString();
        buffer.push(part.substring(0, part.indexOf('\0')))
        handleMessage(buffer.join());
        buffer = [];
        const tail = part.substr(part.indexOf('\0')+1);
    
        if (tail.length) {
           processChunk(tail); 
        }
    } else {
        buffer.push(data.toString());
    }    
}

const handleMessage = message => {
    const dataReceived = JSON.parse(message);
    if(dataReceived.type == constants.MAKE_MOVE) {
        handlePrompt(dataReceived.roomID)
    } else {
        console.log(dataReceived.message)
    }
}

const handlePrompt = roomID => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('It\'s your turn, please Make your move', move => {
        let response = {type:constants.MOVE_MADE, moveMade: move, roomID: roomID}
        client.write(JSON.stringify(response))
        rl.close();
    });
}

client.on('data', processChunk);