import express from 'express';
import cors from 'cors';
import morgan from 'morgan'
import helmet from 'helmet';

//importacion de los contrladores de usuarios
import tournamentControllers from './controllers/tournamentControllers.js';
import userControllers from './controllers/userControllers.js';

const app  = express();
const port = 3000

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.set('views', 'views');
app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/', tournamentControllers.getAllTournaments)
// Ruta para renderizar la vista de registro
app.get('/register', userControllers.renderRegister);

// Ruta para manejar el registro de un nuevo usuario
app.post('/register', userControllers.userRegister);

app.listen(port, ()=>{
    console.log(`la aplicacion es ejecuntadonse en http://localhost:${port}`)
})