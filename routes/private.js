import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router()
const prisma = new PrismaClient();

router.get('/api/list', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            omit: {
                password: true
            }
        })

        res.status(200).json({ messasge: 'Users listed sucessfuly!', users })
    } catch (error) {
        res.status(500).json({ error: 'Erro no servidor!' });
    }
});

export default router;