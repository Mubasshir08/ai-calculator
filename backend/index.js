import express from "express";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import OpenAI from "openai/index.mjs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"], 
}));
const port = process.env.PORT || 5000;
const upload = multer({ dest: "uploads/" });

// Initialize OpenAI
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// OpenAI
// app.post("/process-image", upload.single("image"), async (req, res) => {
//     try {
//         const imagePath = req.file.path;
//         const imageData = fs.readFileSync(imagePath, { encoding: "base64" });

//         const response = await openai.chat.completions.create({
//             model: "gpt-3.5-turbo-0125", // Make sure this is the right model
//             messages: [
//                 { role: "system", content: "You are an AI that processes hand-drawn math equations." },
//                 { role: "user", content: "What is this equation?" },
//                 { role: "user", content: { image: `data:image/png;base64,${imageData}` } }
//             ],
//         });

//         fs.unlinkSync(imagePath); // Delete the uploaded file after processing

//         res.json({ result: response.choices[0].message.content });
//     } catch (error) {
//         console.error("Error processing image:", error);
//         res.status(500).json({ error: "Failed to process the image." });
//     }
// });

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Gemini
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
    console.log(`Server running on port ${port}`);
});