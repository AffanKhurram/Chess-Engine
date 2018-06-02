var chess = new Chess();

// AI part here
var makeMove = function () {
    var t1 = new Date().getTime();
    var bestMove = minimax(chess, 3, true);
    var t2 = new Date().getTime();
    alert(Math.round(positionCount*1000/(t2-t1)) + " " + positionCount);
    chess.ugly_move(bestMove);
    board.position(chess.fen());
    if (chess.game_over()) {
        endScreen();
    }
}

var makeMove2 = function (maximizingPlayer) {
    var bestMove = minimax(chess.fen(), 2, maximizingPlayer);
    chess.ugly_move(bestMove);
    board.position(chess.fen());
    if (chess.game_over()) {
        endScreen();
    }
}

// Setup everything for the board
var onDrop = function (source,  target) {
    var move = chess.move({from: source, to: target});

    if (move === null) {
        move = chess.move({from: source, to: target, promotion: 'q'});
        if (move === null) {
            return 'snapback';
        } else {
            // Take in input for the promotion
        }
    }

    if (chess.game_over()) {
        endScreen();
    }
    window.setTimeout(makeMove, 250);
}

var onSnapEnd = function () {
    board.position(chess.fen());
}

var endScreen = function () {
    if (chess.in_checkmate()) {
        alert("Checkmate!");
    } else if (chess.in_stalemate()){
        alert("Stalemate");
    } else if (chess.in_draw()) {
        alert("Draw by insufficient material");
    } else if (chess.in_threefold_repetition()) {
        alert("Draw by threefold repetition");
    }
}

// Create the board
var config = {
    draggable: true,
    dropOffBoard: 'snapback',
    position: 'start',
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
};
var board = ChessBoard('board', config);