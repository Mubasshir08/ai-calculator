import express from "express";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
const port = 5000;
const upload = multer({ dest: "uploads/" });

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/process-image", upload.single("image"), async (req, res) => {
    try {
        const imagePath = req.file.path;
        const imageData = fs.readFileSync(imagePath, { encoding: "base64" });

        // Initialize the Gemini model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Prepare the image for Gemini
        const image = {
            inlineData: {
                data: imageData,
                mimeType: "image/png", // Adjust mimeType based on the uploaded file type
            },
        };

        // Send the image to Gemini
        const prompt = "What is this equation?";
        const result = await model.generateContent([prompt, image]);
        const response = await result.response;
        const text = response.text();

        // Delete the uploaded file after processing
        fs.unlinkSync(imagePath);

        // Send the response back to the client
        // console.log(text);
        res.json({ result: text });
    } catch (error) {
        console.error("Error processing image:", error);
        res.status(500).json({ error: "Failed to process the image." });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});