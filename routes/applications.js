// Importando bibliotecas
import express from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import streamifier from 'streamifier';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';

// Importando middlewares
import auth from '../middlewares/auth.js';
import admin from '../middlewares/admin.js';

// Variaveis de ambiente & apps
const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint para criar uma aplicação
router.post('/create', auth, admin, upload.single('icon'), async (req, res) => {

});

// Endpoint para listar aplicações
router.get('/list', auth, async (req, res) => {

});

// Endpoint para buscar aplicação por ID
router.get('/list/:id', auth, async (req, res) => {

});

// Endpoint para deletar aplicação por ID
router.delete('/delete/:id', auth, admin, async (req, res) => {
    
});

// Endpoint para atualizar aplicação por ID
router.put('/update/:id', auth, admin, upload.single('icon'), async (req, res) => {

});

export default router; // Exportando o router