import { useState } from 'react'; // We use this to create stateful properties in our functions.
import "./App.css"; // This provides the styles that affect all of the markup we generate.

// This is a convenience type for specifying a player: none, X, O, or both.
type Player = "" | "X" | "O" | "both";

// This is the starting point for our application. "export" makes this function
// visible to other files which include this file. "default" means that if
// another file includes this file and uses an <App /> tag, it will run this function
// and render the return value in place of that tag.
export default function Game() {
  // This creates a boolean property called currentMove, and a function for
  // setting it called setCurrentMove(bool). This property lives in the state
  // of this Game component. It's value won't change between calls to Game()
  // unless *we* change it — it will remember it's value from call to call.
  // It's like a static local variable in C/C++. We use this keep track of
  // our current move and allow us to jump back in time to previous states.
  const [currentMove, setCurrentMove] = useState(0);

  // This is *not* stateful, but is re-calculated every time Game() is
  // called. It tracks who's playing next. X has even turns, O has odd turns.
  const xIsNext = currentMove % 2 === 0;

  // This creates a stack of snapshots of the game board state. The game
  // board state is just an array of 9 Players, with each entry corresponding
  // to a tile on the board and the current player that "owns" it.
  const [history, setHistory] = useState([Array<Player>(9).fill("")]);

  // This contains the last item on the history stack. By default,
  // that stack contains one empty item, so this starts off as a blank
  // game board.
  const currentState = history[currentMove];

  // This gets invoked whenever a square gets clicked.
  function handlePlay(nextSquares: Array<Player>): void {
    // We take history up to our currentMove (which may have changed due to a jump)
    // and append the next layout of the board.
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);

    // This gets us the index of the end of the history stack. We use nextHistory
    // because history will not be immediately updated.
    setCurrentMove(nextHistory.length - 1);
  }

  // This gets invoked by the buttons for rewinding the moves.
  function jumpTo(nextMove: number): void {
    setCurrentMove(nextMove); // Go to the move specified.
  }

  // This helper creates a list of buttons corresponding to move history.
  const moves = history.map((squares: Array<Player>, move: number) => {
    let description = "";
    if (!move) {
      description = "Restart"
    } else {
      description = `Jump to turn ${move + 1}`;
    }

    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentState} numTurns={currentMove+1} handlePlay={(nextSquares: Array<Player>) => handlePlay(nextSquares)}/>
      </div>
      <div className="game-info">
        <ul>
          {moves}
        </ul>
      </div>
    </div>
  );
}// Game()

// This specifies params that we will pass into our Board()
// component below. This is like a struct or a class definition.
interface BoardParams {
  xIsNext: boolean,
  squares: Array<Player>,
  numTurns: number,
  handlePlay: (nextSquares: Array<Player>) => void
};


// This is responsible for drawing the game board. Its parameters
// are of the type specified in the BoardParams interface above.
// Note that our parameters are surrounded by {}. That's because
// React is going to pass in a single JavaScript object containing
// all of our input properties. The braces are the notation
// for that incoming object.
function Board({xIsNext, squares, numTurns, handlePlay}: BoardParams) {
  // Translate turn into a display-able letter. Note that this doesn't use state!
  const playerLetter = xIsNext? "X": "O";

  // Status message we will display to players.
  const message: string = ( () => {
    const winner = calculateWinner(squares);
    let result: string = "";

    // Display turn info if there isn't a winner.
    if (!winner || !winner.length) {
      result = `Turn ${numTurns} for ${playerLetter}.`;
    }
    else if (winner === "both") { // Handle a draw.
      result = "It's a draw!";
    }
    else { // If we get here, *somebody* won.
      result = `${winner} is the winner!`;
    }

    return result;
  })(); // This trick is an Immediately Invoked Function Expression — thanks Copilot!

  // This runs whenever a square gets clicked. It takes a number "i" as a
  // parameter, and returns nothing ("void").
  function handleClick(i: number): void  {
    const nextSquares = squares.slice(); // A trick for duplicating an array.
    const winner = calculateWinner(nextSquares);
    
    // If this square is already filled or we have a winner, we won't do anything.
    if (!winner.length && !nextSquares[i].length)
    {
      // nextSquares is a const reference. The constness here means that we can't
      // change what it points to. However, we can still change the *contents*
      // of what it points too. That's why we're able to index it with [i]
      // and change the corresponding value.
      nextSquares[i] = playerLetter;
 
      handlePlay(nextSquares);
    }
  } // handleClick()

  // This is the markup we emit. We wrap in <></> which is a little trick that
  // satisfies the requirement of only returning a single top-level element.
  // We "escape" into JavaScript with {}. In order to pass in a parameterized
  // function, we use an anonymous function for onSquareClick that calls
  // a named parameterized function. If we just used handleClick(42) directly
  // everything would get borked because that's not a reference to a function,
  // but a function call (the result of which gets wired up to onSquareClick),
  // so the function would immediately get called, and that would update the data,
  // and that would trigger a refresh, and that would ultimately trigger this function
  // call again, creating an infinite loop of doom.
  return (
    <>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
      <div>
        {message}
      </div>
    </>
  ); // return()
}// Board()


// Parameters for Square() below.
interface SquareParams {
  value: string;  // Text to display in square.
  onSquareClick: () => void; // Function to call when clicked.
}// SquareProps()

// This function draws each square on our board.
function Square({ value, onSquareClick }: SquareParams) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}// Square()


// This function returns true if we have a winner. It does
// a brute force search of all possibilities.
function calculateWinner(squares: Array<Player>): Player {
  const winConditions = [
    // Index sequences of potential horizontal wins.
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    // Index sequences of potential vertical wins.
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    // Index sequences of potential diagonal wins.
    [0, 4, 8],
    [2, 4, 6]
  ];

  // First check for a winner.
  let result: Player = "";
  for (const [a, b, c] of winConditions) {
    if (squares[a].length && squares[a] === squares[b] && squares[a] === squares[c]) {
      // If we get here, the letter here is the winner.
      result = squares[a];
    }
  }

  // If we didn't have any winner's, check for draw.
  if (result === "") {
    let isDraw = true;
    for (const square of squares) {
      if (square === "") {
        isDraw = false;
        break;
      }
    }
    if (isDraw) {
      result = "both";
    }
  }

  return result;
}// calculateWinner()
