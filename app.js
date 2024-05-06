import express from 'express';
import cors from 'cors';
import morgan from 'morgan'
import helmet from 'helmet';

//importacion de los controladores.
import tournamentControllers from './controllers/tournamentControllers.js';
import userControllers from './controllers/userControllers.js';
import teamControllers from './controllers/teamControllers.js';
import authorization from './middlewares/authorization.js';

const app  = express();
const port = 3000

// Configuracion de la app.
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Configuracion del motor de vista y la ruta de las vistas de la app.
app.set('views', 'views');
app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Ruta principal.
app.get('/', tournamentControllers.getAllTournaments)

// Ruta registro.
app.get('/register', authorization.onlyNoLogin, userControllers.renderRegister);
app.post('/register', authorization.onlyNoLogin, userControllers.userRegister);

//Ruta login
app.get('/login', authorization.onlyNoLogin, userControllers.renderLogin);
app.post('/login', authorization.onlyNoLogin, userControllers.userLogin);

//Ruta tournament
app.get('/tournament', authorization.onlyLogin, tournamentControllers.renderTournaments);

app.get('/tournament/history', authorization.onlyLogin, tournamentControllers.getHistory);

app.get('/tournament/participate', authorization.onlyLogin, tournamentControllers.getIParticipateIn);
app.get('/tournament/participate/:id', authorization.onlyLogin, tournamentControllers.getDetailsTournament);

app.get('/tournament/mytournaments', authorization.onlyLogin, tournamentControllers.getMyTournaments);
app.get('/tournament/mytournaments/:id', authorization.onlyLogin, tournamentControllers.getDetailsTournament);

app.get('/tournament/join/:id', authorization.onlyLogin, tournamentControllers.joinTournamenent);

app.get('/tournament/mytournament/edit/:id', authorization.onlyLogin, );
app.post('/tournament/mytournament/edit/:id', authorization.onlyLogin, );

app.get('/tournament/newtournament', authorization.onlyLogin, tournamentControllers.renderNewTournaments);
app.post('/tournament/newtournament', authorization.onlyLogin, tournamentControllers.creationNewTournament);

app.get('/tournament/newtournament/addrace/:id', authorization.onlyLogin, tournamentControllers.renderAddRace);
app.post('/tournament/newtournament/addrace', authorization.onlyLogin, tournamentControllers.addRace);

//Ruta team
app.get('/team', authorization.onlyLogin, teamControllers.teamRender);

app.get('/team/participate', authorization.onlyLogin, teamControllers.getIParticipateIn);
app.get('/team/participate/:id', authorization.onlyLogin, teamControllers.getDetailTeam);

app.get('/team/myteam', authorization.onlyLogin, teamControllers.getMyTeams);
app.get('/team/myteam/:id', authorization.onlyLogin, teamControllers.getDetailTeam);

app.get('/team/newteam',authorization.onlyLogin, teamControllers.creationNewTeamRender);
app.post('/team/newteam',authorization.onlyLogin, teamControllers.creationNewTeam);

app.get('/myteam/edit',authorization.onlyLogin, teamControllers.editTeam);

// Inicio de la app iniciando la escucha en http://localhost:3000
app.listen(port, ()=>{
    console.log(`la aplicacion es ejecuntadonse en http://localhost:${port}`)
})