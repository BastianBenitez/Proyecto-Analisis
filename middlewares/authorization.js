import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';
import connection from '../config/connectionDB.js';
import { query } from 'express';

dotenv.config();

async function onlyLogin (req, res, next){
    const validationtoken = await tokenAuthorization(req);
    if (validationtoken){
        next();
    }else{
        res.redirect('/login')
    }
};

async function onlyNoLogin (req, res, next){
    const validationtoken = await tokenAuthorization(req);
    if (!validationtoken){
        next();
    }else{
        res.redirect('/')
    }
};

async function tokenAuthorization (req){
    if(!req.headers.cookie) return false;
    try{
        const cookieMTSLCM = req.headers.cookie.split('; ').find(cookie => cookie.startsWith('MTSLCM='));
        
        if (!cookieMTSLCM) return false;

        const token = cookieMTSLCM.slice(7);
        const decoded = jsonwebtoken.verify(token, process.env.MTSLCM_ENCODER);

        const query = "SELECT COUNT(*) AS count FROM usuarios WHERE NombreUsuario = ?";
        const result = await connection.query(query, [decoded.user]);

        if (result[0][0].count === 1 && decoded.exp - decoded.iat > 0) {
            return true
        }else{
            return false
        }
    }catch{
        return false
    }
};

async function getUserIDToken (req){
    const cookieMTSLCM = req.headers.cookie.split('; ').find(cookie => cookie.startsWith('MTSLCM=')).slice(7);
    const decoded = jsonwebtoken.verify(cookieMTSLCM, process.env.MTSLCM_ENCODER);
    const query = 'SELECT UserID FROM usuarios WHERE NombreUsuario = ?';

    try{
        const [[result]] = await connection.query(query, [decoded.user]);
        return result
    }catch(error){
        console.log(error)
    };
}


export default { onlyLogin, onlyNoLogin, tokenAuthorization, getUserIDToken };