import connection from '../config/connectionDB.js';

// Renderiza la vista de registro
const renderRegister = (req, res) => {
  res.render('register.pug');
};

// Maneja el registro de un nuevo usuario
const userRegister = async (req, res) => {
  // Optencion de las variables del formulario de registro.
  const { username, email, password } = req.body;

  try {
    // Consulta a la base de datos
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
    
    // Inserta un nuevo usuario en la base de datos
    const insertQuery = 'INSERT INTO usuarios (userName, password, email) VALUES (?, ?, ?)';
    await connection.query(insertQuery, [username, password, email]);

    res.status(201).json({ success: true, message: 'Usuario registrado exitosamente' });

  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ success: false, message: 'Error en el registro, por favor intenta de nuevo' });
  }

};

export default { renderRegister, userRegister };