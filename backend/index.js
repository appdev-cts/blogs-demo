const express = require("express");
const path = require('path');
require("./config/db");
const userRouter = require('./routes/Users.routes');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const cron = require('node-cron');

// Create an Express application
const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
}));
// Create an HTTP server and attach socket.io to it
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: false, limit: "200mb" }));
app.use('/uploads', express.static('uploads'));
app.use('/profile', express.static(path.join(__dirname, 'uploads/profile')));

// Middleware to attach the io instance to the request object
app.use((req, res, next) => {
  req.app.set('socketio', io);
  next();
});

// Socket.io connection setup
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinBlog', ({ blogId }) => {
    socket.join(blogId);
    console.log(`User joined blog room: ${blogId}`);
  });
  socket.on('join', (userId) => {
    socket.join(userId);
    socket.userId = userId;
    console.log(`User connected with ${userId}`) // Join a room identified by the user's ID
  });
  socket.on('leaveBlog', ({ blogId }) => {
    socket.leave(blogId);
    console.log(`User left blog room: ${blogId}`);
  });


  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});
// cron.schedule('1,2,3,4,5 * * * *', () => {
//   console.log('running a task every minute');
// });
// Routes
app.use('/api/users', userRouter);


// Start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
