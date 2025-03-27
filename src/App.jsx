import React, { useEffect, useRef, useState } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import db from "./firebaseConfig";

const BreakoutGame = () => {
  const canvasRef = useRef(null);
  const [name, setName] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "scores"));
      const fetchedScores = querySnapshot.docs.map((doc) => doc.data());
      setScores(fetchedScores);
    } catch (error) {
      console.error("Error fetching scores: ", error);
    }
  };

  const saveScore = async () => {
    if (!name.trim()) return;
    try {
      await addDoc(collection(db, "scores"), {
        name,
        score,
        date: new Date(),
      });
      fetchScores();
    } catch (error) {
      console.error("Error saving score: ", error);
    }
  };

  const startGame = () => {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;

    let ball = { x: width / 2, y: height - 30, dx: 3, dy: -3, radius: 10 };
    let paddle = { x: width / 2 - 50, width: 100, height: 10 };
    let bricks = [];
    let rows = 5, cols = 7;
    let brickWidth = width / cols - 10;
    let brickHeight = 20;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({ x: c * (brickWidth + 10), y: r * (brickHeight + 10) + 50, status: 1 });
      }
    }

    const movePaddle = (e) => {
      if (e.key === "ArrowLeft") paddle.x = Math.max(0, paddle.x - 30);
      if (e.key === "ArrowRight") paddle.x = Math.min(width - paddle.width, paddle.x + 30);
    };
    document.addEventListener("keydown", movePaddle);

    const gameLoop = setInterval(() => {
      ctx.clearRect(0, 0, width, height);
      
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = "red";
      ctx.fill();
      ctx.closePath();
      
      ctx.fillStyle = "green";
      ctx.fillRect(paddle.x, height - 20, paddle.width, paddle.height);
      
      bricks.forEach((brick) => {
        if (brick.status === 1) {
          ctx.fillStyle = "orange";
          ctx.fillRect(brick.x, brick.y, brickWidth, brickHeight);
        }
      });

      ball.x += ball.dx;
      ball.y += ball.dy;

      if (ball.x <= 0 || ball.x >= width) ball.dx = -ball.dx;
      if (ball.y <= 0) ball.dy = -ball.dy;

      if (
        ball.y >= height - 30 &&
        ball.x >= paddle.x &&
        ball.x <= paddle.x + paddle.width
      ) {
        ball.dy = -ball.dy;
      }
      
      if (ball.y >= height) {
        clearInterval(gameLoop);
        setGameOver(true);
        saveScore();
        document.removeEventListener("keydown", movePaddle);
      }

      bricks.forEach((brick) => {
        if (
          brick.status === 1 &&
          ball.x >= brick.x &&
          ball.x <= brick.x + brickWidth &&
          ball.y >= brick.y &&
          ball.y <= brick.y + brickHeight
        ) {
          ball.dy = -ball.dy;
          brick.status = 0;
          setScore((prev) => prev + 10);
        }
      });
    }, 16);
  };

  return (
    <div style={{ textAlign: "center" }}>
      {!gameStarted ? (
        <div>
          <h1>Breakout Game</h1>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={startGame}>Start Game</button>
          <h2>Leaderboard:</h2>
          {scores.map((player, index) => (
            <p key={index}>{player.name}: {player.score}</p>
          ))}
        </div>
      ) : (
        <>
          {gameOver && <h2>Game Over, {name}! Score: {score}</h2>}
          <canvas ref={canvasRef} width={500} height={400} style={{ backgroundColor: "#000" }} />
        </>
      )}
    </div>
  );
};

export default BreakoutGame;
