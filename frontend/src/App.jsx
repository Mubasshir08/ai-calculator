import { useRef, useState, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import axios from 'axios';
import getCroppedImg from './utils/cropImage';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [result, setResult] = useState(null);
  const [color, setColor] = useState("black");
  const [clicked, setClicked] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 400 });

  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (window.innerWidth > 1024) {
        setCanvasSize({ width: 1000, height: 400 });
      } else {
        setCanvasSize({ width: Math.min(window.innerWidth * 0.9, 600), height: 400 });
      }
    };
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setResult(null);
  };

  const onButtonClick = (col) => {
    setClicked(true);
    setColor(col);
    setIsErasing(false);
  };

  const handleStart = (e) => {
    e.preventDefault();
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

  const handleTakePicture = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const imageURL = URL.createObjectURL(file);
    setSelectedImage(imageURL);
    setIsCropping(true);
  };

  const onCropComplete = (_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleCropDone = async () => {
    try {
      const croppedFile = await getCroppedImg(selectedImage, croppedAreaPixels);
      const formData = new FormData();
      formData.append("image", croppedFile);

      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/process-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(response.data.result);
      setIsCropping(false);
      setSelectedImage(null);
    } catch (err) {
      console.error("Cropping error", err);
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

      {!isCropping && (
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="border bg-white"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      )}

      {isCropping && selectedImage && (
        <div className="relative w-full max-w-[600px] h-[400px]">
          <Cropper
            image={selectedImage}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
          <div className="absolute bottom-4 right-4 z-10">
            <button onClick={handleCropDone} className="bg-green-600 text-white px-4 py-2 rounded">Done</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap justify-center">
        <button onClick={clearCanvas} className="px-4 py-2 bg-gray-500 text-white rounded">Clear</button>
        <button onClick={sendToAI} className="px-4 py-2 bg-blue-500 text-white rounded">Calculate</button>
        <button onClick={handleTakePicture} className="px-4 py-2 bg-green-600 text-white rounded">Take Picture</button>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </div>

      {result && (
        <p className="text-xl text-green-300 font-bold mt-4 text-center whitespace-pre-wrap">
          {result}
        </p>
      )}
    </div>
  );
}

export default App;
