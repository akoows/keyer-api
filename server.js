// Importando bibliotecas
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import usersRoute from "./routes/users.js";
import applicationsRoute from "./routes/applications.js";
import utilitiesRoutes from "./routes/utilities.js";
import { v2 as cloudinary } from "cloudinary";
import rateLimit from "express-rate-limit";

// Configurações iniciais
const rateLIMITER = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 50, // Limite de 50 requisições por IP
  message:
    "Muitas requisições vindas deste IP, por favor tente novamente mais tarde.",
});
dotenv.config(); // Configurando variaveis de ambiente
cloudinary.config({
  // Configuração do DB de Imagens
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const app = express(); // Iniciando o app do express
app.use(express.json()); // Liberando o JSON no express
app.use(
  cors({
    // Liberando o acesso via cors
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);

// Rotas
app.use("/users", usersRoute, rateLIMITER); // Rota de usuarios
app.use("/applications", applicationsRoute, rateLIMITER); // Rota de aplicações
app.use("/", utilitiesRoutes); // Rota de utilidades

app.listen(process.env.PORT, () => {
  // Rodando o Servidor
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
