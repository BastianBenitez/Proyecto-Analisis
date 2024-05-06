import connection from '../config/connectionDB.js';
import authorization from '../middlewares/authorization.js';
import bcryptjs from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';
import { query } from 'express';

dotenv.config();

const noHTML = str => !/<[a-z][\s\S]*>/i.test(str);

const renderRegister = (req, res) => res.status(200).render('register.pug');

const renderLogin = (req, res) => res.status(200).render('login.pug');

const userRegister = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'Todos los campos deben de estar completados' });
  } else if (username.length > 15 || !noHTML(username) || !noHTML(email) || !noHTML(password)) {
    return res.status(400).json({ success: false, message: 'Uno o varios de los campos no son válidos, inténtelo de nuevo' });
  }

  try {
    const [userCount] = await connection.query("SELECT COUNT(*) AS count FROM usuarios WHERE NombreUsuario = ?", [username]);
    const [emailCount] = await connection.query("SELECT COUNT(*) AS count FROM usuarios WHERE CorreoElectronico = ?", [email]);

    if (userCount[0].count === 1) {
      return res.status(400).json({ success: false, message: 'El nombre de usuario ya está registrado' });
    } else if (emailCount[0].count === 1) {
      return res.status(400).json({ success: false, message: 'El correo electrónico ya está registrado' });
    }

    const salt = await bcryptjs.genSalt(5);
    const hashPassword = await bcryptjs.hash(password, salt);

    await connection.query('INSERT INTO usuarios (NombreUsuario, Contrasena, CorreoElectronico) VALUES (?, ?, ?)', [username, hashPassword, email]);

    return res.status(201).json({ success: true, message: 'Usuario registrado exitosamente', redirect: "/login" });
  } catch (error) {
    console.error('Error en el registro:', error);
    return res.status(500).json({ success: false, message: 'Error en el registro, por favor intenta de nuevo' });
  }
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ success: false, message: 'Todos los campos deben de estar completados' });


  try {
    const [emailCount] = await connection.query("SELECT COUNT(*) AS count FROM usuarios WHERE CorreoElectronico = ?", [email]);

    if (emailCount[0].count === 0) return res.status(400).json({ success: false, message: 'El correo electrónico no está registrado' });

    const [userData] = await connection.query("SELECT NombreUsuario, CorreoElectronico, Contrasena FROM usuarios WHERE CorreoElectronico = ?", [email]);
    const logonCorrect = await bcryptjs.compare(password, userData[0].Contrasena);

    if (logonCorrect) {
      const token = jsonwebtoken.sign({ user: userData[0].NombreUsuario }, process.env.MTSLCM_ENCODER, { expiresIn: process.env.MTSLCM_TIME_EXPIRED });
      const cookieOptions = {
        expires: new Date(Date.now() + process.env.MTSLCM_COOKIE_EXPIRED * 24 * 60 * 60 * 1000),
        path: "/"
      };
      res.cookie('MTSLCM', token, cookieOptions);
      return res.status(201).json({ success: true, message: 'Inicio de sesión exitoso', redirect: "/" });
    } else {
      return res.status(400).json({ success: false, message: 'El correo y/o contraseña son incorrectas' });
    }
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    return res.status(500).json({ success: false, message: 'Error al iniciar sesión, por favor intenta de nuevo' });
  }
};

const renderEdituser = async (req, res) => {
  const userID = await authorization.getUserIDToken(req);
  const query = 'SELECT NombreUsuario, CorreoElectronico FROM usuarios WHERE UserID = ?';
  

  try{
    const [[result]] = await connection.query(query, [userID.UserID])
    return res.status(200).render('edituser.pug', { result, userID, status: true, statuslogin: true });
  }catch(error){
    console.log(error);
    return res.status(500).send("Error en el server");

  }
}

const editUser = async (req, res) => {
  try {
    const userID = await authorization.getUserIDToken(req);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Todos los campos deben de estar completados' });
    }

    if (name.length > 15 || !noHTML(name) || !noHTML(email)) {
      return res.status(400).json({ success: false, message: 'Uno o varios de los campos no son válidos, inténtelo de nuevo' });
    }

    const [[userData]] = await connection.query("SELECT CorreoElectronico, Contrasena FROM usuarios WHERE UserID = ?", [userID]);
    const { CorreoElectronico: currentEmail, Contrasena: currentPassword } = userData;

    if (email !== currentEmail) {
      const [emailCount] = await connection.query("SELECT COUNT(*) AS count FROM usuarios WHERE CorreoElectronico = ?", [email]);
      if (emailCount[0].count === 1) {
        return res.status(400).json({ success: false, message: 'El correo electrónico ya está registrado' });
      }
    }

    const passwordCorrect = await bcryptjs.compare(password, currentPassword);
    if (!passwordCorrect) {
      return res.status(400).json({ success: false, message: 'La contraseña actual es incorrecta' });
    }

    const queryUpdate = 'UPDATE usuarios SET NombreUsuario = ?, CorreoElectronico = ? WHERE UserID = ?';
    await connection.query(queryUpdate, [name, email, userID]);

    return res.status(201).json({ success: true, message: 'Datos Actualizados', redirect: "/" });

  } catch (error) {
    console.error('Error en la edición del usuario:', error);
    return res.status(500).json({ success: false, message: 'Error en la edición del usuario, por favor intenta de nuevo' });
  }
}



export default { 
  renderRegister, 
  userRegister, 
  renderLogin, 
  userLogin,
  renderEdituser,
  editUser
};
