import express from 'express'
import http from 'http';
import { Server } from 'socket.io'; 
import { User } from '../models/user.model.js';
import cors from 'cors';

const UserSocketMap = {}; // Map to associate userId with their socket ID
const setupchat= (server)=>{
const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
  
    // Store user socket association
    socket.on('register-user', (userId) => {
      // Associate socket ID with user in a store (e.g., Redis or in-memory map)
      UserSocketMap[userId] = socket.id;
    });
  
    // Join chat or group room
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });
  
    // Handle new message
    socket.on('personal-message', ({ message, roomId }) => {
      socket.to(roomId).emit('personal-message', { message });
    });
    socket.on('community-message', ({ message, roomId }) => {
      socket.to(roomId).emit('community-message', { message });
  });  
  
    // Notify recipient
    socket.on('send-notification', async ({ toUserId, message }) => {
      const recipientSocketId = User[toUserId];
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('notification', { message });
      }
      else {
        await Notification.create({
          user:toUserId,
          message,
          type: chat
        })
      }
    });
  
    // Handle disconnect
    socket.on('disconnect', () => {
      for (const userId in UserSocketMap) {
          if (UserSocketMap[userId] === socket.id) {
              delete UserSocketMap[userId];
              console.log(`User ${userId} disconnected`);
              break;
          }
      }
  });
  });
}

export {setupchat}