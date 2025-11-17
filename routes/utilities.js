// Importando bibliotecas
import express from 'express';
import { PrismaClient } from '@prisma/client';

// Instanciando apps
const router = express.Router()
const prisma = new PrismaClient();

// Endpoint de status do server
router.get('/status', async (req, res) => {
    const users = await prisma.user.count(); // Contando os usuarios cadastrados no DB

    res.json({ // Resposta do Status
        status: 'online', // Status
        uptime: process.uptime(), // Tempo online
        users: users, // Contagem de usuarios
    });
})

export default router; // Exportando o router