import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import connectDB from './utils/db.js';
import authRouter from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import adminRouter from './routes/admin.route.js';
import http from 'http';
import { Server } from 'socket.io'; 

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  }
});

// Middleware setup
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

app.use('/api/v1', authRouter);
app.use('/api/v1/admin', adminRouter);

app.get('/', (req, res) => {
    res.status(200).json({ message: "SERVER WORKING FINE!" });
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.emit('welcome', { message: 'Welcome to the server!' });

    // Centralized 'match_updated' event to handle all changes
    socket.on('match_updated', (match) => {
        console.log('Match updated:', match);
        io.emit('match_updated', match); // Emit event for all connected clients
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
    connectDB(); // Connect to DB
});
