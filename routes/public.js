import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();
const jwtSecret = process.env.JWT_SECRET;

// Cadastro
router.post('/api/register', async (req, res) => {
    const user = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(user.password, salt);

    try {
        const userDB = await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                password: hashPassword
            }
        });
        res.status(201).json(userDB);
    } catch (error) {
        res.status(500).json({ error: 'Erro no servidor!' });
    }
});

// Login
router.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body; // Pegando as infos do banco
        const user = await prisma.user.findUnique({ where: { email: email } }) // achando no DB

        if (!user) {  // Se não existir o usuario
            res.status(404).json({ message: 'User not found!' })
        };

        const passCompare = await bcrypt.compare(password, user.password); // Comparando a senha com o hash

        if (!passCompare) { /// Caso a senha esteja errada
            res.status(400).json({ message: 'Password incorrectly!' })
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' }); //Gerar JWT

        res.status(200).json(token); // Retornando o token
    } catch (error) {
        res.status(500).json({ error: 'Erro no servidor!' });
    }
});

export default router;