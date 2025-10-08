import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import dbConnection from "./utils/db.js"
import userRoutes from './routes/userRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js'
import chatRoutes from './routes/chatRoutes.js'

dotenv.config()

const app = express()

app.use(express.json())
app.use(cors())

dbConnection()

// Routes
app.use('/api/users', userRoutes);
app.use('/api', blogRoutes);
app.use('/api', reviewRoutes);
app.use('/api', ticketRoutes);
app.use('/api', chatRoutes);

// health route
app.get('/', (req, res) => {
  res.json({ message: 'User API is running' });
});


app.listen(3000, () => {
  console.log("server is up")
})