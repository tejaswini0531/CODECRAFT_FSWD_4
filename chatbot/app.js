const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files (optional, if you have frontend files like HTML, CSS, etc.)
app.use(express.static('public'));

// Set up a simple route for testing
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

let totalClients = 0;

// Handle socket connections
io.on('connection', (socket) => {
  totalClients++;
  io.emit('clients-total', totalClients);  // Broadcast total clients to all clients
  console.log('A user connected');

  // When a message is received from the client, broadcast it to all clients
  socket.on('message', (data) => {
    io.emit('chat-message', data);
  });

  // When a user starts typing (feedback), broadcast it to others
  socket.on('feedback', (data) => {
    socket.broadcast.emit('feedback', data);  // Send feedback to everyone except the sender
  });

  // When a user starts typing (first feedback), broadcast it to others
  socket.on('fffeedback', (data) => {
    socket.broadcast.emit('feedback', data);  // Send feedback to everyone except the sender
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    totalClients--;
    io.emit('clients-total', totalClients);  // Update total clients when someone disconnects
    console.log('A user disconnected');
  });
});

// Start the server
server.listen(3005, () => {
  console.log('Server running on http://localhost:3005');
});