import { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const [result, setResult] = useState(null);
  const [color, setColor] = useState("black");
  const [clicked, setClicked] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 400 });

  useEffect(() => {
    // Adjust canvas size based on screen width
    const updateCanvasSize = () => {
        if (window.innerWidth > 1024) {
          // Laptop/Desktop (Width 1000px)
          setCanvasSize({ width: 1000, height: 400 });
        } else {
          // Mobile/Tablet (90% of screen width)
          setCanvasSize({ width: Math.min(window.innerWidth * 0.9, 600), height: 400 });
        }
      };
    
      updateCanvasSize(); // Set initial size
      window.addEventListener("resize", updateCanvasSize);
      return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setResult(null);
  };

  const onButtonClick = (color) => {
    setClicked(true);
    setColor(color);
    setIsErasing(false);
  };

  const handleStart = (e) => {
    e.preventDefault(); // Prevent scrolling when drawing
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPosition(e);

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    canvas.isDrawing = true;
  };

  const handleMove = (e) => {
    if (!canvasRef.current.isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPosition(e);

    ctx.strokeStyle = isErasing ? "white" : color;
    ctx.lineWidth = isErasing ? 10 : 3;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const handleEnd = () => {
    canvasRef.current.isDrawing = false;
  };

  const getPosition = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const sendToAI = async () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL("image/png");
    const blob = await (await fetch(imageData)).blob();
    const formData = new FormData();
    formData.append("image", blob, "drawing.png");

    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/process-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data.result);
    } catch (error) {
      console.error("Error sending image to backend", error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex gap-2 mt-2 flex-wrap justify-center">
        {['black', 'red', 'blue', 'cyan'].map((col) => (
          <button key={col} onClick={() => onButtonClick(col)}
            className={`w-5 h-5 rounded-full hover:scale-150 ${clicked && color === col ? "border-2 border-white scale-150" : ""}`}
            style={{ backgroundColor: col }}>
          </button>
        ))}
        <button onClick={() => { onButtonClick("white"); setIsErasing(true); }}
          className={`w-5 h-5 bg-gray-300 text-black rounded ${clicked && isErasing ? "border-2 border-white scale-150" : ""}`}>
          🖌
        </button>
      </div>
      <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} className="border bg-white"
        onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd}
        onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd} />
      <div className="flex gap-2">
        <button onClick={clearCanvas} className="px-4 py-2 bg-gray-500 text-white rounded">Clear</button>
        <button onClick={sendToAI} className="px-4 py-2 bg-blue-500 text-white rounded">Calculate</button>
      </div>
      {result && <p className="text-xl text-white">{result}</p>}
    </div>
  );
}

export default App;
