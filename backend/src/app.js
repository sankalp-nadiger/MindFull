import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

// Router imports
import userRouter from './routes/user.routes.js';
import resourceRouter from "./routes/resource.routes.js";
import activityRouter from "./routes/activity.routes.js";
import communityRouter from "./routes/community.routes.js";
import counsellorRouter from "./routes/counsellor.routes.js";
import dm_chatRouter from "./routes/dm_chat.routes.js";
import journalRouter from "./routes/journal.routes.js";
import parentRouter from "./routes/parent.routes.js";
import storyRouter from "./routes/story.routes.js";
import postsRouter from "./routes/posts.routes.js";
import taskRouter from "./routes/task.route.js";
import recomendations from "./routes/recommendations.route.js";
import visionRouter from "./routes/visionboard.routes.js";
const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173','https://mindfullweb.netlify.app'],// Adjust the frontend URL as needed
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'] 
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
app.use("/api/users", userRouter);
app.use("/api/resources", resourceRouter);
app.use("/api/journals", journalRouter);
app.use("/api/activity", activityRouter);
app.use("/api/community", communityRouter); 
app.use("/api/counsellor", counsellorRouter);
app.use("/api/dm_chat", dm_chatRouter);
app.use("/api/parent", parentRouter);
app.use("/api/story", storyRouter);
app.use("/api/post", postsRouter);
app.use("/api/visionBoard", visionRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/recommendations", recomendations);

app.post("/api/chat", async (req, res) => {
    try {
        const { message } = req.body;
        console.log("User message:", message);

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "Gemini API key is not configured" });
        }

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{ role: "user", parts: [{ text: message }] }],
            }
        );

        console.log("Full API Response:", JSON.stringify(response.data, null, 2));

        const botResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!botResponse) {
            return res.status(500).json({ error: "No response from Gemini API" });
        }

        console.log("Extracted bot response:", botResponse);
        res.json({ botResponse });
    } catch (error) {
        console.error("Detailed error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        res.status(500).json({ 
            error: "Internal Server Error", 
            details: error.response?.data || error.message 
        });
    }
});

export default app;
