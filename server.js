// Importando bibliotecas
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import usersRoute from './routes/users.js';
import applicationsRoute from './routes/applications.js';
import utilitiesRoutes from './routes/utilities.js';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config(); // Configurando variaveis de ambiente
cloudinary.config({ // Configuração do DB de Imagens
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API, 
    api_secret: process.env.CLOUDINARY_API_SECRET
})
const app = express(); // Iniciando o app do express
app.use(express.json()); // Liberando o JSON no express
app.use(cors({ // Liberando o acesso via cors
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type, Authorization"
}))

app.use('/users', usersRoute); // Rota de usuarios
app.use('/applications', applicationsRoute); // Rota de aplicações
app.use('/', utilitiesRoutes); // Rota de utilidades

app.listen(process.env.PORT, () => { // Rodando o Servidor
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});