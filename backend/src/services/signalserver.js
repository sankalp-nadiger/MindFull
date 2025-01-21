import { Server } from 'socket.io';

const setupSignalServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('offer', (data) => {
    socket.to(data.to).emit('offer', data);
  });

  socket.on('answer', (data) => {
    socket.to(data.to).emit('answer', data);
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.to).emit('ice-candidate', data);});
    socket.on('disconnect', () => {
        console.log(`WebRTC User disconnected: ${socket.id}`);
    });
});
}

export {setupSignalServer}