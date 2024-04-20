import connection from '../config/connectionDB.js';

// Renderiza la vista de registro
const renderRegister = (req, res) => {
  res.render('register.pug');
};

// Maneja el registro de un nuevo usuario
const userRegister = async (req, res) => {
  const { username, email, password } = req.body;
  console.log(username);
  console.log(email);
  console.log(password);

  try {
    
    const query = "SELECT COUNT(*) AS count FROM usuarios WHERE email = ?";
    const result = await connection.query(query, [email]);
 
    if (result[0][0].count === 1) {
        return res.status(400).json({ success: false, message: 'El correo electrónico ya está registrado' });
      }
    
    // Inserta un nuevo usuario en la base de datos
    const insertQuery = 'INSERT INTO usuarios (userName, password, email) VALUES (?, ?, ?)';
    await connection.query(insertQuery, [username, email, password]);

    res.status(201).json({ success: true, message: 'Usuario registrado exitosamente' });

  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ success: false, message: 'Error en el registro, por favor intenta de nuevo' });
  }

};

export default { renderRegister, userRegister };