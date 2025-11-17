// IMportando bibliotecas
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

// Variaveis de ambiente & apps
const JWT_SECRET = process.env.JWT_SECRET;
const prisma = new PrismaClient();

// Função
const admin = async (req, res, next) => {
    const token = req.headers.authorization; // Pegando o token

    if(!token){return res.send(401).json({ message: "Acesso Negado!"})} // Se não tiver token

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET); // Decodificando o token
        const uID = decoded.id; // Guardando o User ID

        const user = await prisma.user.findUnique({ where: { id: uID } }); // Encontrando o usuario no DB

        if(user.admin == true){ // Se for admin
            next(); // Continue
        } else { // Se não
            return res.status(403).json({ message: "Acesso Negado! Você não é um administrador."}); // Retornando 403
        }
    } catch (error) { // Token invalido
        return res.status(401).json({ message: "Token Invalido!"}); // Retornando 401 e uma mensagem
    }
}

export default admin; // Exportando