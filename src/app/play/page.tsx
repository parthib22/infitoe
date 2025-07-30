// in the special case of winning with disappearing character, the board rotates after win

"use client";
import { useState } from "react";
import Image from "next/image";

const WIN_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export default function Home() {
  const [board, setBoard] = useState<string[]>(Array(9).fill(""));
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  const winner = calculateWinner(board);
  const limit = 3;

  const [queueX, setQueueX] = useState<number[]>([]);
  const [queueO, setQueueO] = useState<number[]>([]);

  function handleClick(index: number) {
    if (board[index] || winner) return;

    // Determine current player
    const symbol = xIsNext ? "x" : "o";
    const queue = xIsNext ? queueX : queueO;
    const setQueue = xIsNext ? setQueueX : setQueueO;

    // Clone state
    const nextBoard = [...board];
    const nextQueue = [...queue];

    // Tentatively place mark
    nextBoard[index] = symbol;
    nextQueue.push(index);

    // Check for win before eviction
    const potentialWinner = calculateWinner(nextBoard);
    if (potentialWinner === symbol) {
      setBoard(nextBoard);
      setQueue(nextQueue);
      setXIsNext(!xIsNext);
      return;
    }

    // Enforce max‐three rule
    if (nextQueue.length > limit) {
      const removed = nextQueue.shift()!;
      nextBoard[removed] = "";
    }

    // Batch update
    setBoard(nextBoard);
    setQueue(nextQueue);
    setXIsNext(!xIsNext);
  }

  function resetGame() {
    setQueueX([]);
    setQueueO([]);
    setBoard(Array(9).fill(""));
    setXIsNext(!xIsNext);
  }

  // const status = winner
  //     ? `Winner: ${winner}`
  //     : board.every(cell => cell)
  //         ? 'Draw'
  //         : `Next ${xIsNext ? 'x' : 'o'}`;

  return (
    <>
      <section className="absolute w-screen flex flex-col h-svh bg-gray-50">
        <main
          className={`${
            !xIsNext && "opacity-100"
          } flex items-end justify-center flex-1 w-full text-teal-700 font-bold p-3 rotate-180 select-none`}
        >
          <span>Player X</span>
        </main>
        <main
          className={`${
            xIsNext && "opacity-100"
          } flex items-end justify-center flex-1 w-full text-orange-700 font-bold p-3 select-none`}
        >
          <span>Player O</span>
        </main>
      </section>
      <section
        className={`transition-all duration-1000 ease-in-out ${
          xIsNext && !winner && "rotate-180"
        } absolute w-full flex flex-col items-center justify-center min-h-svh`}
      >
        <div className="grid grid-cols-3 border-2 border-gray-50">
          {board.map((cell, idx) => (
            <button
              key={idx}
              onClick={() => handleClick(idx)}
              className={`text-white font-bold w-20 h-20 ${
                queueX.includes(idx)
                  ? "bg-teal-700"
                  : queueO.includes(idx)
                  ? "bg-orange-700"
                  : "bg-gray-200 hover:bg-gray-300"
              } border-2 border-gray-50 flex items-center justify-center text-2xl ${
                !winner &&
                ((xIsNext && queueX.length === limit && queueX[0] === idx) ||
                  (!xIsNext && queueO.length === limit && queueO[0] === idx))
                  ? "blink-animation"
                  : ""
              } transition-all duration-300 ease-in-out cursor-pointer`}
            >
              {cell}
            </button>
          ))}
        </div>
        <button
          onClick={resetGame}
          className="absolute bottom-24 flex justify-center items-center w-16 text-2xl font-light rotate-90 bg-transparent text-blue-950 rounded-full aspect-square hover:bg-gray-100 transition-all duration-300 ease-in-out cursor-pointer"
        >
          <Image
            src={winner ? "reset.svg" : "arrow.svg"}
            alt="reset / rotate"
            width={36}
            height={36}
            className={"-rotate-90"}
          />
        </button>
      </section>
    </>
  );
}

function calculateWinner(squares: string[]): string | null {
  for (const combo of WIN_COMBINATIONS) {
    const [a, b, c] = combo;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
