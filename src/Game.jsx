import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";  // Importamos las funciones de Firestore
import { db } from "./firebaseConfig";  // Asegúrate de que importas db desde firebaseConfig

// Componente del tablero de juego
const Game = () => {
  const [board, setBoard] = useState(Array(9).fill(null));  // Estado del tablero
  const [xIsNext, setXIsNext] = useState(true);  // Turno de X o O
  const [winner, setWinner] = useState(null);  // Ganador del juego
  const [playerName, setPlayerName] = useState("");  // Nombre del jugador
  const [score, setScore] = useState(0);  // Puntuación del jugador

  // Comprobar si hay un ganador
  const calculateWinner = (board) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Filas
      [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Columnas
      [0, 4, 8], [2, 4, 6],              // Diagonales
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];  // Devuelve X o O
      }
    }
    return null;
  };

  const handleClick = (index) => {
    if (board[index] || winner) return;  // Si la celda ya está ocupada o el juego ya terminó

    const newBoard = [...board];
    newBoard[index] = xIsNext ? "X" : "O";  // Asigna el símbolo del jugador
    setBoard(newBoard);
    setXIsNext(!xIsNext);  // Cambia el turno
    setWinner(calculateWinner(newBoard));  // Verifica si hay un ganador
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));  // Reinicia el tablero
    setWinner(null);
    setXIsNext(true);  // Comienza con X
  };

  // Función para guardar la puntuación en Firestore
  const saveScore = async () => {
    if (!playerName.trim()) return;  // Si el nombre está vacío, no guardar
    try {
      await addDoc(collection(db, "scores"), {
        name: playerName,
        score: score,
        date: new Date(),
      });
      alert("Puntuación guardada!");
    } catch (error) {
      console.error("Error saving score: ", error);
    }
  };

  // Llamamos a esta función cuando el juego termina
  React.useEffect(() => {
    if (winner) {
      const newScore = winner === "X" ? 1 : 0;  // Aquí puedes asignar diferentes puntuaciones si lo deseas
      setScore(newScore);
      saveScore();  // Guardamos la puntuación en Firebase cuando haya un ganador
    }
  }, [winner]);

  return (
    <div>
      <div className="game-board">
        {board.map((cell, index) => (
          <div
            key={index}
            className="cell"
            onClick={() => handleClick(index)}
          >
            {cell}
          </div>
        ))}
      </div>
      {winner ? (
        <div>
          <h2>Winner: {winner}</h2>
          <h3>Score: {score}</h3>
          <button onClick={resetGame}>Play Again</button>
        </div>
      ) : (
        <h2>Next Player: {xIsNext ? "X" : "O"}</h2>
      )}

      {/* Input para que el jugador ingrese su nombre */}
      <div>
        <input
          type="text"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Game;
