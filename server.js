import express from 'express';
import dotenv from 'dotenv';
import publicRoutes from './routes/public.js';
import privateRoutes from './routes/private.js';

import auth from './middlewares/auth.js';

dotenv.config();
const app = express();
app.use(express.json());

app.use('/', publicRoutes); // Public Routes
app.use('/', auth, privateRoutes); // Private Routes

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});