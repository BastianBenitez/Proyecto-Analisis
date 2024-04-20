import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Configuracion para el correcto uso de los datos del archivo .env.
dotenv.config();

// Crear la coneccion a la base de datos.
const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

export default connection;