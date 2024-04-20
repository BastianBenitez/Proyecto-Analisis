import connection from '../config/connectionDB.js';
import bcryptjs from 'bcryptjs'

// Funcion encargada de detectar codigo html
function noHTML(str) {
  return !/<[a-z][\s\S]*>/i.test(str);
}

// Renderiza la vista de registro
const renderRegister = (req, res) => {
  res.render('register.pug');
};

const renderlogin = (req, res) => {
  res.render('login.pug');
}

// Maneja el registro de un nuevo usuario.
const userRegister = async (req, res) => {
  // Optencion de las variables del formulario de registro.
  const { username, email, password } = req.body;

  // verrificacion que los datos.
  if (!username || !email || !password){
    return res.status(400).json({ success: false, message: 'Todos los campos deben de estar completados' });
  } else{
    if (username.length >15){
      return res.status(400).json({ success: false, message: 'El nombre del usuario no puede tener mas de 15 caracteres' });
    }else if (!noHTML(username) || !noHTML(email) || !noHTML(password)){
      return res.status(400).json({ success: false, message: 'uno o varios de los campos no son validos, intentelo de nuevo' });
    }
  }

  try {
    // Consulta a la base de datos.
    const queryuser = "SELECT COUNT(*) AS count FROM usuarios WHERE userName = ?";
    const resultuser = await connection.query(queryuser, [username]);

    const queryemail = "SELECT COUNT(*) AS count FROM usuarios WHERE email = ?";
    const resultemail = await connection.query(queryemail, [email]);

    // Verificacion de duplicado en el username y email
    if (resultuser[0][0].count === 1) {
        return res.status(400).json({ success: false, message: 'El nombre de usuario ya está registrado' });
      }else if (resultemail[0][0].count === 1){
        return res.status(400).json({ success: false, message: 'El correo electronico ya está registrado' });
      }
    
    // Incriptacion de la contrasena
    const salt = await bcryptjs.genSalt(5);
    const hashPassword = await bcryptjs.hash(password, salt)

    // Inserta un nuevo usuario en la base de datos
    const insertQuery = 'INSERT INTO usuarios (userName, password, email) VALUES (?, ?, ?)';
    await connection.query(insertQuery, [username, hashPassword, email]);

    return res.status(201).json({ success: true, message: 'Usuario registrado exitosamente', redirect:"/login"});

  } catch (error) {
    console.error('Error en el registro:', error);
    return res.status(500).json({ success: false, message: 'Error en el registro, por favor intenta de nuevo' });
  }

};

const userlogin = async (req, res) => {
  // Optencion de las variables del formulario de registro.
  const {email, password} = req.body;

  try {
    // Consulta a la base de datos
    const queryemail = "SELECT COUNT(*) AS count FROM usuarios WHERE email = ?";
    const resultemail = await connection.query(queryemail, [email]);

    // Verificacion de duplicado en el username y email
    if (resultemail[0][0].count === 0){
      return res.status(400).json({ success: false, message: 'El correo electronico no está registrado' });
    }
    
    // Inserta un nuevo usuario en la base de datos
    const insertQuery = 'INSERT INTO usuarios (userName, password, email) VALUES (?, ?, ?)';
    await connection.query(insertQuery, [username, password, email]);

    res.status(201).json({ success: true, message: 'Loging completo' });

  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ success: false, message: 'Error al iniciar sesion, por favor intenta de nuevo' });
  }

};

export default { renderRegister, userRegister, renderlogin, userlogin };