import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import usersRoute from './routes/users.js';
import utilitiesRoutes from './routes/utilities.js';
import { v2 as cloudinary } from 'cloudinary';

import auth from './middlewares/auth.js';

dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API, 
    api_secret: process.env.CLOUDINARY_API_SECRET
})
const app = express();
app.use(express.json());
app.use(cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type, Authorization"
}))

app.use('/users', usersRoute); // Users Route
app.use('/', utilitiesRoutes); // Private Routes

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});