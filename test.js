var chess = new Chess();

var t1 = new Date().getTime();
for (var i = 0; i < 2888; i++) {
    var moves = chess.ugly_moves({verbose: true});
    for (var j = 0; j < moves.length; j++) {
        chess.ugly_move(moves[j]);
        chess.undo();
    }
    -evaluateBoard(chess.board());
}
var t2 = new Date().getTime();
alert(t2-t1);