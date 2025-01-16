import express from 'express'
import http from 'http';
import { Server } from 'socket.io'; 
import { User } from '../models/user.model';
import cors from 'cors';

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
        User[userId] = socket.id;
    });
  
    // Join chat or group room
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });
  
    // Handle new message
    socket.on('send-message', ({ message, roomId }) => {
      socket.to(roomId).emit('personal-message', { message });
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
      console.log(`User disconnected: ${socket.id}`);
      // Remove socket ID association
    });
  });
}
export {setupchat}