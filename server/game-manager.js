export default class GameManager {
    constructor() {
        this.board = [1,2,3,4,5,6,7,8,9]
        this.winningCombinations = [[0, 1, 2], [3, 4, 5], 6, [7, 8], [0, 3, 6], [1, 4,7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    }

    displayBoard() {
        return '\n' +
        this.board[0] + ' | ' + this.board[1] + ' | ' + this.board[2] + '\n' +
        '---------\n' +
        this.board[3] + ' | ' + this.board[4] + ' | ' + this.board[5] + '\n' +
        '---------\n' +
        this.board[6] + ' | ' + this.board[7] + ' | ' + this.board[8] + '\n'
    }

    makeMove(move, player) {
        this.board[move - 1] = player
    }

    checkWinner(player) {
        for (let i = 0; i < this.winningCombinations.length; i++) {
            let count = 0;
            for (let j = 0; j < this.winningCombinations[i].length; j++) {
                if (this.board[this.winningCombinations[i][j]] === player) {
                    count++;
                }
                if (count === 3) {
                    return true;
                }
            }
        }
        return false;
    }

    checkTie() {
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === i+1) {
                return false;
            }
        }
        return true;
    }

    validateMove(move) {
        if(isNaN(move)) {
            console.log('please enter a number')
            return false
        }
        else if (move > 9) {
            console.log('please enter a valid number')
            return false
        } else {
            return true
        }
    }
}