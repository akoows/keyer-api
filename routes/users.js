import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import streamifier from 'streamifier';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';

import auth from '../middlewares/auth.js';
import admin from '../middlewares/admin.js';

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });
const JWT_SECRET = process.env.JWT_SECRET;

// Register
router.post('/register', async (req, res) => {
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
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body; // Pegando as informações do DB
        const user = await prisma.user.findUnique({ where: { email: email } }) // achando no DB

        if (!user) {  // Se não existir o usuario
            res.status(404).json({ message: 'Usuario não encontrado!' })
        };

        const passCompare = await bcrypt.compare(password, user.password); // Comparando a senha com o hash

        if (!passCompare) { /// Caso a senha esteja errada
            res.status(400).json({ message: 'Senha Incorreta!' })
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' }); //Gerar JWT

        res.status(200).json(token); // Retornando o token
    } catch (error) {
        res.status(500).json({ error: 'Erro no servidor!' });
    }
});

// 2FA Verification

// List - Admin only
router.get('/list', admin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            omit: {
                password: true
            }
        });

        res.status(200).json({ messasge: 'Listado usuarios com sucesso!', users })
    } catch (error) {
        res.status(500).json({ error: 'Erro no servidor!' });
    }
});

// List user by ID - Admin only
router.post('/list/:id', admin, async (req, res) => {
    const { id } = req.params;

    try {
        const user = await prisma.user.findUnique({ where: { id: parseInt(id) }, omit: { password: true }});
    } catch (error) {
        res.status(500).json({ error: 'Erro no servidor!' });
    }
});

//Delete user - Admin only
router.delete('/:id', admin, async (req, res) => {
    const { id } = req.params;

    try {
        const deletedUser = await prisma.user.delete({ where: { id: id }});
        res.status(200).json({ message: 'Usuario deletado com sucesso!', deletedUser });
    } catch (error) {
        res.status(500).json({ error: 'Erro no servidor!' });
    }
});

// Upload user avatar
router.post('/:id/avatar', auth, upload.single('file'), async (req, res) => {
    const { id } = req.params;

    try {
        if (!req.file)
            return res.status(400).json({ message: 'Nenhum arquivo enviado!' });

        const streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "keyer_pfp" },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        // Aguarda o upload terminar
        const result = await streamUpload(req);

        // Atualiza o usuário com a URL do Cloudinary
        const user = await prisma.user.update({
            where: { id: id },
            data: { picture: result.secure_url }
        });

        res.json({
            message: "Upload realizado com sucesso!",
            url: result.secure_url,
            public_id: result.public_id
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao enviar imagem para o Cloudinary!' });
    }
});

export default router;