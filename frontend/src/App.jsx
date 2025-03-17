import { useRef, useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const canvasRef = useRef(null);
  const [result, setResult] = useState(null);
  const [color, setColor] = useState("black");
  const [clicked, setClicked] = useState(false);
  const [isErasing, setIsErasing] = useState(false);

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
  }

  const handleMouseDown = (e) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.beginPath();
      ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      canvas.isDrawing = true;
  };

  const handleMouseMove = (e) => {
      if (!canvasRef.current.isDrawing) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (isErasing) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 10;
    } else {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
    }
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctx.stroke();
  };

  const handleMouseUp = () => {
      canvasRef.current.isDrawing = false;
  };

  const sendToAI = async () => {
      const canvas = canvasRef.current;
      const imageData = canvas.toDataURL("image/png");

      const blob = await (await fetch(imageData)).blob();
      const formData = new FormData();
      formData.append("image", blob, "drawing.png");

      try {
          const response = await axios.post(`${import.meta.env.SERVER_URL}/process-image`, formData, {
              headers: { "Content-Type": "multipart/form-data" }
          });
        //   console.log(response)
          setResult(response.data.result);
      } catch (error) {
          console.error("Error sending image to backend", error);
      }
  };

  return (
      <div className="flex flex-col items-center gap-4 p-4">
         <div className="flex gap-2 mt-2">
              <button onClick={() => onButtonClick("black")} className={`w-5 h-5 bg-black text-white rounded-full hover:scale-150 ${clicked && color === "black" ? "border-2 border-white scale-150" : ""}`}></button>
              <button onClick={() => onButtonClick("red")} className={`w-5 h-5 bg-red-500 text-white rounded-full hover:scale-150 ${clicked && color === "red" ? "border-2 border-white scale-150" : ""}`}></button>
              <button onClick={() => onButtonClick("blue")} className={`w-5 h-5 bg-blue-500 text-white rounded-full hover:scale-150 ${clicked && color === "blue" ? "border-2 border-white scale-150" : ""}`}></button>
              <button onClick={() => onButtonClick("cyan")} className={`w-5 h-5 bg-cyan-400 text-white rounded-full hover:scale-150 ${clicked && color === "cyan" ? "border-2 border-white scale-150" : ""}`}></button>
              <button onClick={() => {onButtonClick("white"); setIsErasing(true)}} className={`w-5 h-5 bg-gray-300 text-black rounded ${clicked && color === "white" ? "border-2 border-white scale-150 h-6" : ""}`}>🖌</button>
          </div>
          <canvas 
              ref={canvasRef} 
              width={1000} 
              height={400} 
              className="border bg-white"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
          />
          <div className="flex gap-2">
              <button onClick={clearCanvas} className="px-4 py-2 bg-gray-500 text-white rounded">Clear</button>
              <button onClick={sendToAI} className="px-4 py-2 bg-blue-500 text-white rounded">Calculate</button>
          </div>
         
          {result && <p className="text-xl text-white">{result}</p>}
      </div>
  );
}

export default App
