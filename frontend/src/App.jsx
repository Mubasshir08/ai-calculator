import { useRef, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Cropper from 'react-easy-crop';
import getCroppedImg from './utils/cropImage'; // helper
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [result, setResult] = useState(null);
  const [color, setColor] = useState("black");
  const [clicked, setClicked] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 400 });
  const [loading, setLoading] = useState(false);

  // Cropper state
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

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
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleTakePicture = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const uploadCroppedImage = async () => {
  setShowCropper(false); // Hide the cropper immediately
  try {
    setLoading(true);
    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
    const formData = new FormData();
    formData.append("image", croppedImage, "cropped.png");

    const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/process-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setResult(response.data.result);
  } catch (error) {
    console.error("Error uploading cropped image", error);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Color Buttons */}
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

      {/* Canvas */}
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

      {/* Action Buttons */}
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

      {/* Show Re-crop if image was uploaded */}
      {imageSrc && !showCropper && (
        <button onClick={() => setShowCropper(true)} className="px-4 py-2 bg-yellow-500 text-white rounded">
          Re-crop Image
        </button>
      )}

      {/* Loading */}
      {loading && <p className="text-yellow-400 text-lg font-bold animate-pulse">Processing...</p>}

      {/* Result */}
      {result && (
        <p className="text-xl text-green-300 font-bold mt-4 text-center whitespace-pre-wrap">
          {result}
        </p>
      )}

      {/* Cropper Modal */}
      {showCropper && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/80 flex flex-col items-center justify-center z-50">
          <div className="relative w-[90vw] h-[60vh] bg-black">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="flex gap-4 mt-4">
            <button onClick={uploadCroppedImage} className="bg-blue-600 text-white px-4 py-2 rounded">Upload</button>
            <button onClick={() => {
              setShowCropper(false);
              setCrop({ x: 0, y: 0 });
              setZoom(1);
            }} className="bg-red-600 text-white px-4 py-2 rounded">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
