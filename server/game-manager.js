export default class GameManager {
    static displayBoard(board) {
        return '\n' +
        board[0] + ' | ' + board[1] + ' | ' + board[2] + '\n' +
        '---------\n' +
        board[3] + ' | ' + board[4] + ' | ' + board[5] + '\n' +
        '---------\n' +
        board[6] + ' | ' + board[7] + ' | ' + board[8] + '\n'
    }

    static makeMove(board, move, player) {
        board[move - 1] = player
    }

    static checkWinner(board, player) {
        let winningCombinations = [[0, 1, 2], [3, 4, 5], 6, [7, 8], [0, 3, 6], [1, 4,7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]

        for (let i = 0; i < this.winningCombinations.length; i++) {
            let count = 0;
            for (let j = 0; j < this.winningCombinations[i].length; j++) {
                if (board[this.winningCombinations[i][j]] === player) {
                    count++;
                }
                if (count === 3) {
                    return true;
                }
            }
        }
        return false;
    }

    static checkTie(board) {
        for (let i = 0; i < board.length; i++) {
            if (board[i] === i+1) {
                return false;
            }
        }
        return true;
    }
}