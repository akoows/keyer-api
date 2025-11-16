import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const prisma = new PrismaClient();

const admin = async (req, res, next) => {
    const token = req.headers.authorization;

    if(!token){return res.send(401).json({ message: "Acesso Negado!"})} // Se não tiver token

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
        const uID = decoded.id;

        const user = await prisma.user.findUnique({ where: { id: uID } });

        if(user.admin == true){
            next();
        } else {
            return res.status(403).json({ message: "Acesso Negado! Você não é um administrador."});
        }
    } catch (error) { // Token invalido
        return res.status(401).json({ message: "Token Invalido!"});
    }
}

export default admin;