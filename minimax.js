var positionCount;  // For statistical purposes

var minimax = function (game, depth, maximizingPlayer) {

    var bestVal;                            // The best value the ai can make
    var bestMove;                           // The best move the ai can make
    var moves = game.ugly_moves();               // Array containing all legal moves for the current game state
    positionCount = 0;                      // Reset the postion count

    // Go through all the possible moves and then find the best one
    for (var i = 0; i < moves.length; i++) {
        game.ugly_move(moves[i]);
        var ab = alphabeta(game, depth - 1, -100000, 100000, !maximizingPlayer);
        game.undo();
        if (i === 0) {
            bestVal = ab;
            bestMove = moves[i];
        }
        // Check if the move is "better"
        else if (maximizingPlayer? ab >= bestVal : ab <= bestVal) {
            bestVal = ab;
            bestMove = moves[i];
        }
    }
    return bestMove;
}

// This is used to simultaneously create the tree as well as search for the best one
// using the alpha beta pruning algorithm
var alphabeta = function (game, depth, alpha, beta, maximizingPlayer) {
    // Return the value of the board if we don't need to search any deeper
    if (depth === 0) {
        if (game.in_checkmate()) {
            return maximizingPlayer? -100000 : 100000;
        } else if (game.in_stalemate()) {
            return 0;
        }
        //return -evaluateBoard(game.board());
        return quiescenceSearch(game, 0, alpha, beta, maximizingPlayer);
    }

    positionCount++;
    // Setup the necessary variables
    var val;
    var moves = game.ugly_moves();

    if (maximizingPlayer) {
        val = -100000;
        for (var i = 0; i < moves.length; i++) {
            game.ugly_move(moves[i]);
            val = Math.max(val, alphabeta(game, depth - 1, alpha, beta, !maximizingPlayer));
            game.undo();
            alpha = Math.max(val, alpha);
            if (beta <= alpha) {
                break;
            }
        }
    } else {
        val = 100000;
        for (var i = 0; i < moves.length; i++) {
            game.ugly_move(moves[i]);
            val = Math.min(val, alphabeta(game, depth - 1, alpha, beta, !maximizingPlayer));
            game.undo();
            beta = Math.min(val, beta);
            if (beta <= alpha) {
                break;
            }
        }
    }
    return val;
}

// Affan's version
var quiescenceSearch = function (game, depth, alpha, beta, maximizingPlayer) {
    positionCount++;
    var moves = game.ugly_moves({verbose: true});    // Verbose mode gives us more information on the move
    if (depth === 0) {
        var board = game.board();
        return -evaluateBoard(board); // negative cuz we assume that black is maximizing player, but eval does it in a way that white is held as the maximizing player
    } 

    var val = -evaluateBoard(game.board());
    if (maximizingPlayer) {
        val = -100000;
        for (var i = 0; i < moves.length; i++) {
            if (moves[i].flags === 1) {
                continue;
            }
            game.ugly_move(moves[i]);
            val = Math.max(val, quiescenceSearch(game, depth - 1, alpha, beta, !maximizingPlayer));
            game.undo();
            alpha = Math.max(val, alpha);
            if (beta <= alpha) {
                break;
            }
        }
    } else {
        val = 100000;
        for (var i = 0; i < moves.length; i++) {
            game.ugly_move(moves[i]);
            val = Math.min(val, quiescenceSearch(game, depth - 1, alpha, beta, !maximizingPlayer));
            game.undo();
            beta = Math.min(val, beta);
            if (beta <= alpha) {
                break;
            }
        }
    }
    return val;
}

// Jason's version
var qSearch = function (game, depth, alpha, beta, maximizingPlayer) {
    positionCount++;
    var noisyMoves = generateNoisyMoves(game.ugly_moves({verbose: true}));

    if (depth === 0 || noisyMoves.length === 0) {
        return -evaluateBoard(game.board());
    }

    for (var i = 0; i < noisyMoves.length; i++) {
        game.ugly_move(noisyMoves[i]);
        var value = -qSearch(game, depth - 1, -alpha, -beta, !maximizingPlayer);
        game.undo();
        if (value >= beta) {
            return value;
        }
        if (value > alpha) {
            alpha = value;
        }
    }

    

    return alpha;
}

var generateNoisyMoves = function (moves) {
    var returned = [];
    var j = 0;
    for (var i = 0; i < moves.length; i++) {
        if (moves[i].flags !== 1) {
            returned[j] = moves[i];
            j++
        }
    }
    return returned;
}

// I found this part online, was too lazy to do it myself
// We can figure this part out later
var evaluateBoard = function (board) {
    var totalEvaluation = 0;
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            totalEvaluation = totalEvaluation + getPieceValue(board[i][j], i ,j);
        }
    }
    return totalEvaluation;
};

var reverseArray = function(array) {
    return array.slice().reverse();
};

var pawnEvalWhite =
    [
        [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
        [5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
        [1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0],
        [0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5],
        [0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0],
        [0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5],
        [0.5,  1.0, 1.0,  -2.0, -2.0,  1.0,  1.0,  0.5],
        [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
    ];

var pawnEvalBlack = reverseArray(pawnEvalWhite);

var knightEval =
    [
        [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
        [-4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0],
        [-3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0],
        [-3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0],
        [-3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0],
        [-3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0],
        [-4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0],
        [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
    ];

var bishopEvalWhite = [
    [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
    [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
    [ -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
    [ -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
    [ -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0],
    [ -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
    [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
];

var bishopEvalBlack = reverseArray(bishopEvalWhite);

var rookEvalWhite = [
    [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
    [  0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [  0.0,   0.0, 0.0,  0.5,  0.5,  0.0,  0.0,  0.0]
];

var rookEvalBlack = reverseArray(rookEvalWhite);

var evalQueen = [
    [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
    [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [ -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [  0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [ -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
];

var kingEvalWhite = [

    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
    [ -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
    [  2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0 ],
    [  2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0 ]
];

var kingEvalBlack = reverseArray(kingEvalWhite);




var getPieceValue = function (piece, x, y) {
    if (piece === null) {
        return 0;
    }
    var getAbsoluteValue = function (piece, isWhite, x ,y) {
        if (piece.type === 'p') {
            return 10 + ( isWhite ? pawnEvalWhite[y][x] : pawnEvalBlack[y][x] );
        } else if (piece.type === 'r') {
            return 50 + ( isWhite ? rookEvalWhite[y][x] : rookEvalBlack[y][x] );
        } else if (piece.type === 'n') {
            return 30 + knightEval[y][x];
        } else if (piece.type === 'b') {
            return 30 + ( isWhite ? bishopEvalWhite[y][x] : bishopEvalBlack[y][x] );
        } else if (piece.type === 'q') {
            return 90 + evalQueen[y][x];
        } else if (piece.type === 'k') {
            return 900 + ( isWhite ? kingEvalWhite[y][x] : kingEvalBlack[y][x] );
        }
        throw "Unknown piece type: " + piece.type;
    };

    var absoluteValue = getAbsoluteValue(piece, piece.color === 'w', x ,y);
    return piece.color === 'w' ? absoluteValue : -absoluteValue;
};