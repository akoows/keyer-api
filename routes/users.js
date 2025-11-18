// Importando bibliotecas
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import streamifier from 'streamifier';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

// Importando middlewares
import auth from '../middlewares/auth.js';
import admin from '../middlewares/admin.js';

// Variaveis de ambiente & apps
const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });
const JWT_SECRET = process.env.JWT_SECRET;
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GOOGLE_EMAIL,
        pass: process.env.GOOGLE_PASSWORD
    }
});

// Variaveis de arquivo
let validationTokens = [];

// Gerar token
function generateToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';

    for (let i = 0; i < 6; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return token;
}

// Função de enviar email
function sendEmail(uEmail, token) {
    const mailOptions = {
        from: `Key Author - 2FA <${process.env.GOOGLE_EMAIL}>`,
        to: uEmail,
        subject: 'Key Author – Verificação de Duas Etapas',
        html: `
    <div style="
        background-color: #0d0d0d;
        padding: 40px;
        border-radius: 12px;
        max-width: 500px;
        margin: auto;
        font-family: Arial, sans-serif;
        color: #e5e5e5;
        border: 1px solid #1a1a1a;
    ">
        <div style="text-align:center;">
            <img src="https://res.cloudinary.com/dylkeqcms/image/upload/v1763439107/logo_n06sx4.png" style="width: 140px; margin-bottom: 15px;">
            <h2 style="color: #e53935; margin-bottom: 10px; font-weight: 700;">
                Verificação de Segurança
            </h2>
        </div>

        <p style="font-size: 15px; line-height: 1.5; color: #ccc;">
            Olá! Para continuar seu acesso à <strong>Key Author</strong>, insira o código abaixo no aplicativo:
        </p>

        <div style="
            text-align: center;
            margin: 25px 0;
            padding: 18px 0;
            font-size: 34px;
            font-weight: bold;
            letter-spacing: 8px;
            background-color: #111;
            border-radius: 10px;
            border: 1px solid #2a2a2a;
            color: #e53935;
            box-shadow: 0 0 10px rgba(229,57,53,0.3);
        ">
            ${token}
        </div>

        <p style="text-align:center; font-size: 12px; color: #555;">
            © ${new Date().getFullYear()} Key Author  
            <br>Todos os direitos reservados.
        </p>
    </div>
    `
    };


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Erro:', error);
        } else {
            console.log('Email enviado:', info.response);
        }
    });
}

// Endpoint de registro
router.post('/register', async (req, res) => {
    const user = req.body; // Pegando o usuario da requisição

    const salt = await bcrypt.genSalt(10); // Gerando salt
    const hashPassword = await bcrypt.hash(user.password, salt); // Encripitando a senha

    try {
        const userDB = await prisma.user.create({ // Criando o user no DB
            data: {
                name: user.name,
                email: user.email,
                password: hashPassword
            }
        });

        try { // Gerando e enviando token
            let token = generateToken() // Gerando token
            let obj = { id: userDB.id, token }

            validationTokens.push(obj)
            sendEmail(user.email, token)
        } catch (error) {
            res.status(500).json({ error: 'Erro no servidor!' }); // Retonar erro 500, erro no servidor
        }

        res.status(201).json(userDB); // retornando o usuario
    } catch (error) { // Se não funcionar
        res.status(500).json({ error: 'Erro no servidor!' }); // Retonar erro 500, erro no servidor
    }


});

// Endpoint de Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body; // Pegando as informações da requisição
        const user = await prisma.user.findUnique({ where: { email: email } }) // achando no DB

        if (!user) {  // Se não existir o usuario
            res.status(404).json({ message: 'Usuario não encontrado!' }) // Retornar erro 404
        };

        const passCompare = await bcrypt.compare(password, user.password); // Comparando a senha com o hash

        if (!passCompare) { /// Caso a senha esteja errada
            res.status(400).json({ message: 'Senha Incorreta!' }) // Aviso de senha incorreta
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' }); //Gerar JWT

        res.status(200).json(token); // Retornando o token
    } catch (error) { // Caso não funcione
        res.status(500).json({ error: 'Erro no servidor!' }); // Retornando o erro 500, erro no servidor
    }
});

// Verificação de Dois Fatores
router.post('/2fa', async (req, res) => {
    const { uID, token } = req.body;

    if (!uID || !token) {
        return res.status(400).json({ message: 'Dados ausentes!' });
    }

    // buscar token salvo no array
    const uObj = validationTokens.find(u => u.id === uID);

    if (!uObj) {
        return res.status(400).json({ message: 'Token inválido!' });
    }

    // comparar token
    if (uObj.token !== token) {
        return res.status(400).json({ message: 'Token incorreto!' });
    }

    try {
        // atualizar usuário
        await prisma.user.update({
            where: { id: uID },
            data: { twofa: true }
        });

        // remover token usado
        validationTokens = validationTokens.filter(u => u.id !== uID);

        return res.status(200).json({ message: '2FA verificado com sucesso!' });

    } catch (error) {
        return res.status(500).json({ error: 'Erro ao atualizar usuário!' });
    }
});


// Endpoint de Listar usuarios - Somente Admnistradores
router.get('/list', admin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({ // Achando os usuarios no DB
            omit: { // Omitir informações
                password: true // Omitindo senha
            }
        });

        res.status(200).json({ messasge: 'Listado usuarios com sucesso!', users }) // Retornando os usuarios
    } catch (error) { // Caso não funcione
        res.status(500).json({ error: 'Erro no servidor!' }); // Retornando erro 500, erro no servidor
    }
});

// Endpoint para listar usuarios pelo ID - Somente Adiministradores
router.post('/list/:id', admin, async (req, res) => {
    const { id } = req.params; // Pegando o ID dos Parametros

    try {
        const user = await prisma.user.findUnique({ where: { id: parseInt(id) }, omit: { password: true } }); // Achando usuario no DB pelo ID
    } catch (error) { // Caso não funcione
        res.status(500).json({ error: 'Erro no servidor!' }); // Retornando erro 500, erro no servidor
    }
});

// Endpoint de deletar usuarios pelo ID - Somente Adiministradores
router.delete('/:id', admin, async (req, res) => {
    const { id } = req.params; // Pegando o ID na requisição

    try {
        const deletedUser = await prisma.user.delete({ where: { id: id } }); // Pegando o usuario que vai ser deletado
        res.status(200).json({ message: 'Usuario deletado com sucesso!', deletedUser }); // Caso seja deletado, retornar mensagem e o usuario deletado
    } catch (error) { // Caso não funcione
        res.status(500).json({ error: 'Erro no servidor!' }); // Retornar erro 500, erro no servidor
    }
});

// Endpoint para fazer upload do avatar do usuario
router.post('/:id/avatar', auth, upload.single('file'), async (req, res) => {
    const { id } = req.params; // Pegando o ID do usuario da requisição

    try {
        if (!req.file) // Caso o arquivo não exista
            return res.status(400).json({ message: 'Nenhum arquivo enviado!' }); // Mensagem de erro

        const streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "keyer_pfp" }, // Definindo pasta do CLoudinary
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error); // Caso de erro
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        const result = await streamUpload(req); // Aguarda o upload terminar

        const user = await prisma.user.update({ // Atualiza o usuário com a URL do Cloudinary
            where: { id: id }, // ID do usuario
            data: { picture: result.secure_url } // URL Segura
        });

        res.json({ // Resposta
            message: "Upload realizado com sucesso!",
            url: result.secure_url,
            public_id: result.public_id
        });

    } catch (error) { // Caso não funcione
        res.status(500).json({ message: 'Erro ao enviar imagem para o Cloudinary!' }); // Mensagem de erro no server 500
    }
});

export default router; // Exportando o router