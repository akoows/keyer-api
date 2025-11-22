// Importando bibliotecas
import express from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import streamifier from "streamifier";
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";

// Importando middlewares
import auth from "../middlewares/auth.js";
import admin from "../middlewares/admin.js";

// Variaveis de ambiente & apps
const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });

// Gerar token
function generateHash() {
  const hashSalt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(Date.now().toString(), hashSalt);
  return hash.replace(/\//g, ""); // Removendo barras para evitar problemas na URL
}

// Endpoint para criar uma aplicação
router.post("/create", auth, upload.single("icon"), async (req, res) => {
  const { name, tag } = req.body;

  // Validação
  if (!name || !tag) {
    return res.status(400).json({ message: "Existem campos faltando!" });
  }

  // Tentando criar aplicação
  try {
    const app = await prisma.application.create({
      data: {
        title: name,
        hash: generateHash(),
        appTag: tag.toUpperCase(),
        picture: req.file
          ? await new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "applications_icons" },
                (error, result) => {
                  if (error) return reject(error);
                  resolve(result.secure_url);
                }
              );
              streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
            })
          : undefined,
        ownerId: req.uID,
      },
    });
    res.status(201).json({ message: "Aplicação criada com sucesso!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro no servidor ao criar aplicação.", error });
  }
});

// Endpoint para listar aplicações
router.get("/list", auth, async (req, res) => {
  const apps = await prisma.application.findMany({
    where: { ownerId: req.uID },
    select: {
      title: true,
      appTag: true,
      picture: true,
      createdAt: true,
    },
  });
  res.status(200).json({ applications: apps });
});

// Endpoint para buscar aplicação por ID
router.get("/list/:id", auth, async (req, res) => {
  const { id } = req.params;
  const app = await prisma.application.findFirst({
    where: { id: parseInt(id), ownerId: req.uID },
    select: {
      title: true,
      appTag: true,
      picture: true,
      createdAt: true,
    },
  });
  res.status(200).json({ application: app });
});

// Endpoint para deletar aplicação por ID
router.delete("/delete/:id", auth, async (req, res) => {
  const { id } = req.params;

  await prisma.application.delete({
    where: { id: parseInt(id), ownerId: req.uID },
  });
  res.status(200).json({ message: "Aplicação deletada com sucesso!" });
});

// Endpoint para atualizar aplicação por ID
router.put( "/update/:id", auth, upload.single("icon"), async (req, res) => {
    const { id } = req.params;
    const { name, tag } = req.body;

    // Validação
    if (!name || !tag) {
      return res.status(400).json({ message: "Existem campos faltando!" });
    }

    // Tentando atualizar aplicação
    try {
      const app = await prisma.application.update({
        where: { id: parseInt(id), ownerId: req.uID },
        data: {
          title: name,
          appTag: tag.toUpperCase(),
          picture: req.file
            ? await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                  { folder: "applications_icons" },
                  (error, result) => {
                    if (error) return reject(error);
                    resolve(result.secure_url);
                  }
                );
                streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
              })
            : undefined,
        },
      });
      res.status(200).json({ message: "Aplicação atualizada com sucesso!" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erro no servidor ao atualizar aplicação.", error });
    }
  }
);

export default router; // Exportando o router
