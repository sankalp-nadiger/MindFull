import dotenv from "dotenv"
import connectDB from "./utils/db.connect.js";
import app from './app.js'
import { Server } from "socket.io";
import http from "http";

dotenv.config({
    path: '../.env'
})

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173','https://mindfullweb.netlify.app'],
        methods: ["GET", "POST"]
    }
});


console.log("mongo url:", process.env.MONGODB_URL);

// Store active rooms and users for WebRTC
const activeRooms = new Map(); // roomId -> Set of users
const userRooms = new Map();   // userId -> roomId

// Combined Socket.io handlers for both existing functionality and WebRTC
io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id); 
    console.log(`✅ New WebSocket connected: ${socket.id}`);
    // ========== WEBRTC SOCKET HANDLERS ==========
    
    // Join video room
    socket.on('join-room', ({ room, userId, userType }) => {
      console.log(`👥 ${userType} ${userId} joining room ${room}`);

      // Leave previous room if any
      if (userRooms.has(userId)) {
        const prevRoom = userRooms.get(userId);
        handleLeaveRoom(socket, prevRoom, userId);
      }

      // Join new room
      socket.join(room);
      userRooms.set(userId, room);
      
      // Initialize room if it doesn't exist
      if (!activeRooms.has(room)) {
        activeRooms.set(room, new Set());
      }
      
      const roomUsers = activeRooms.get(room);
      roomUsers.add(userId);

      // Notify others in the room that a new user joined
      socket.to(room).emit('user-joined', {
        userId: userId,
        userType: userType,
        totalUsers: roomUsers.size
      });

      console.log(`✅ ${userType} ${userId} joined room ${room}. Total users: ${roomUsers.size}`);
    });

    // Handle WebRTC offer
    socket.on('offer', ({ room, offer, from, to }) => {
      console.log(`📤 Offer from ${from} to ${to} in room ${room}`);
      
      // Send offer to specific user if 'to' is specified, otherwise broadcast to room
      if (to) {
        socket.to(room).emit('offer', { offer, from, to });
      } else {
        socket.to(room).emit('offer', { offer, from });
      }
    });

    // Handle WebRTC answer
    socket.on('answer', ({ room, answer, from, to }) => {
      console.log(`📤 Answer from ${from} to ${to} in room ${room}`);
      
      if (to) {
        socket.to(room).emit('answer', { answer, from, to });
      } else {
        socket.to(room).emit('answer', { answer, from });
      }
    });

    // Handle ICE candidates
    socket.on('ice-candidate', ({ room, candidate, from }) => {
      console.log(`🧊 ICE candidate from ${from} in room ${room}`);
      socket.to(room).emit('ice-candidate', { candidate, from });
    });

    // Leave room
    socket.on('leave-room', ({ room, userId }) => {
      console.log(`👋 ${userId} leaving room ${room}`);
      handleLeaveRoom(socket, room, userId);
    });

    // Get room info (optional - for debugging)
    socket.on('get-room-info', ({ room }) => {
      const roomUsers = activeRooms.get(room);
      socket.emit('room-info', {
        room: room,
        users: roomUsers ? Array.from(roomUsers) : [],
        totalUsers: roomUsers ? roomUsers.size : 0
      });
    });

    // ========== DISCONNECT HANDLER ==========
    socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.id}`);
        
        // Clean up WebRTC rooms on disconnect
        for (const [userId, room] of userRooms.entries()) {
          if (socket.id === userId || userRooms.get(socket.id) === room) {
            handleLeaveRoom(socket, room, userId);
            break;
          }
        }
    });

    // ========== HELPER FUNCTIONS ==========
    
    // Helper function to handle leaving room
    const handleLeaveRoom = (socket, room, userId) => {
      if (!room || !userId) return;

      socket.leave(room);
      userRooms.delete(userId);

      if (activeRooms.has(room)) {
        const roomUsers = activeRooms.get(room);
        roomUsers.delete(userId);

        // Notify others in the room that user left
        socket.to(room).emit('user-left', {
          userId: userId,
          totalUsers: roomUsers.size
        });

        // Clean up empty rooms
        if (roomUsers.size === 0) {
          activeRooms.delete(room);
          console.log(`🗑️ Room ${room} deleted (empty)`);
        } else {
          console.log(`👋 ${userId} left room ${room}. Remaining users: ${roomUsers.size}`);
        }
      }
    };
});

// Optional: Periodic cleanup of stale rooms
setInterval(() => {
  for (const [room, users] of activeRooms.entries()) {
    if (users.size === 0) {
      activeRooms.delete(room);
      console.log(`🧹 Cleaned up stale room: ${room}`);
    }
  }
}, 60000); // Run cleanup every minute

console.log('✅ Socket.io server initialized with WebRTC support');

// Start server
connectDB()
.then(() => {
    server.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
        console.log(`🎥 WebRTC signaling server ready`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})

// Export server and io for use in other files
export { server, io };