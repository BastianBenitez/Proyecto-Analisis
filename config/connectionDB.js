import mysql from 'mysql';
import dotenv from 'dotenv';

dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

connection.connect((err)=>{
    if (err){
        console.error('Error de coneccion: ', err.stack)
    }else{
        console.log('Se a realizado exitosamente la coneccion a la base de datos')
    }
});

export default connection;