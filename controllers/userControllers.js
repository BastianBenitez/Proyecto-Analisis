import connection from '../config/connectionDB.js';
import bcryptjs from 'bcryptjs'
import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

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
    const queryuser = "SELECT COUNT(*) AS count FROM usuarios WHERE NombreUsuario = ?";
    const resultuser = await connection.query(queryuser, [username]);

    const queryemail = "SELECT COUNT(*) AS count FROM usuarios WHERE CorreoElectronico = ?";
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
    const insertQuery = 'INSERT INTO usuarios (NombreUsuario, Contrasena, CorreoElectronico) VALUES (?, ?, ?)';
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

  if (!email || !password){
    return res.status(400).json({ success: false, message: 'Todos los campos deben de estar completados' });
  }

  try {
    // Consulta a la base de datos
    const query = "SELECT COUNT(*) AS count FROM usuarios WHERE CorreoElectronico = ?";
    const result = await connection.query(query, [email]);

    // Verificacion de duplicado en el username y email
    if (result[0][0].count === 0){
      return res.status(400).json({ success: false, message: 'El correo electronico no está registrado' });
    }else{
      try{
        const querygetuser = "SELECT NombreUsuario, CorreoElectronico, Contrasena FROM usuarios WHERE CorreoElectronico = ?;";
        const resultuser = await connection.query(querygetuser, [email])

        const logoncorrect = await bcryptjs.compare(password, resultuser[0][0].Contrasena)
        if(logoncorrect){

          const token = jsonwebtoken.sign({ 
            user:resultuser[0][0].userName }, 
            process.env.MTSLCM_ENCODER, 
            {expiresIn:process.env.MTSLCM_TIME_EXPIRED})
          
          const cookieoptions = {
            expires: new Date(Date.now() + process.env.MTSLCM_COOKIE_EXPIRED *24*60*60*1000),
            paht:"/"
          }
          res.cookie('MTSLCM', token, cookieoptions)
          return res.status(201).json({ success: true, message: 'Loging completo', redirect:"/"});
        }else{
          return res.status(400).json({ success: false, message: 'El correo y/o contraseña son incorrectas' });
        }
      }catch(error){
        console.log(error)
        return res.status(400).json({ success: false, message: 'No se pudo verifcar los datos, intentelo mas tarde' });
      } 
    }
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ success: false, message: 'Error al iniciar sesion, por favor intenta de nuevo' });
  }

};

export default { renderRegister, userRegister, renderlogin, userlogin };