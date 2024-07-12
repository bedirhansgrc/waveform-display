const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    setTimeout(() => {
        socket.emit('message', { message: '[3,01010010100100010010]' });
        socket.emit('message', { message: '[1,0100111010010101011110010]' });
        socket.emit('message', { message: '[0,0111001001001010111010010010]' });
        socket.emit('message', { message: '[2,01001010101010]' });
        socket.emit('message', { message: '[4,0100001010100101010010]' });
      }, 5000);
  console.log('A user connected');

  socket.on('message', (message) => {
    console.log('Message received:', message);
    socket.broadcast.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
