import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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
import recomendations from "./routes/recommendations.route.js";

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Adjust the frontend URL as needed
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
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
app.use("/api/community", communityRouter);  // Community Chat Route
app.use("/api/counsellor", counsellorRouter);
app.use("/api/dm_chat", dm_chatRouter);
app.use("/api/parent", parentRouter);
app.use("/api/story", storyRouter);
app.use("/api/post", postsRouter);
app.use("/api/recommendations", recomendations);

// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
