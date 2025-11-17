// Importando bibliotecas
import jwt from 'jsonwebtoken';

// Variaveis de ambiente
const JWT_SECRET = process.env.JWT_SECRET

// Função de Autenticação
const auth = (req, res, next) => {
    const token = req.headers.authorization // Pegando o token do header

    if(!token){return res.send(401).json({ message: "Acesso Negado!"})} // Se não tiver token

    try { // Verificando o token
        const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET) // Decodificando o token JWT
        req.uID = decoded.id; // Enviandp o id que estava no token para a requisição
    } catch (error) { // Token invalido
        res.status(401).json({ message: "Token Invalido!"}) // Retornando 401
    }

    next(); // Caso esteja certo, prosseguir
};

export default auth; // Exportando