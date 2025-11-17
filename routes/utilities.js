import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router()
const prisma = new PrismaClient();

import admin from '../middlewares/admin.js';

router.get('/status', async (req, res) => {
    const users = await prisma.user.count();

    console.log(users)

    res.json({
        status: 'online',
        uptime: process.uptime(),
        users: users,
    });
})

export default router;