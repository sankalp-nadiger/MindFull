import dotenv from "dotenv"
import connectDB from "./utils/db.connect.js";
import app from './app.js'
import { Server } from "socket.io";
import http from "http";
dotenv.config({
    path: './.env'
})
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Your frontend URL
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id); 
    console.log(`✅ New WebSocket connected: ${socket.id}`);
    socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.id}`);
    });
});
connectDB()
.then(() => {
    server.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})
export { server, io };