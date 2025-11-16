import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET

const auth = (req, res, next) => {
    const token = req.headers.authorization // Pegando o token do header

    if(!token){return res.send(401).json({ message: "Acesso Negado!"})} // Se não tiver token

    try { // Verificando o token
        const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET)
        req.uID = decoded.id;
    } catch (error) { // Token invalido
        res.status(401).json({ message: "Token Invalido!"})
    }

    next();
};

export default auth;