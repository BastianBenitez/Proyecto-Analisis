import connection from '../config/connectionDB.js';
import jsonwebtoken from 'jsonwebtoken';
import authorization from '../middlewares/authorization.js';

const getAllTournaments = async (req, res) => {
    const query = "SELECT TorneoId, NombreTorneo, Descripcion, DATE_FORMAT(FechaInicio, '%d de %M de %Y') AS fechaInicioLegible, DATE_FORMAT(FechaTermino, '%d de %M de %Y') AS fechaTerminoLegible, OrganizadorID, ResultadoTorneo FROM torneos";
    const validationToken = await authorization.tokenAuthorization(req);

    try {
        const [results] = await connection.query(query);
        const statuslogin = !!validationToken;
        res.render('index.pug', { title: 'Torneos', results, statuslogin });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
};

const getTournamentsByCreator = async (req, res) => {
    const query = "SELECT TorneoId, NombreTorneo, Descripcion, DATE_FORMAT(FechaInicio, '%d de %M de %Y') AS fechaInicioLegible, DATE_FORMAT(FechaTermino, '%d de %M de %Y') AS fechaTerminoLegible, OrganizadorId, ResultadoTorneo FROM torneos WHERE OrganizadorID = ? ORDER BY FechaInicio ASC";
    const queryUser = 'SELECT UserID FROM usuarios WHERE NombreUsuario = ?';
    
    try {
        const cookieMTSLCM = req.headers.cookie.split('; ').find(cookie => cookie.startsWith('MTSLCM=')).slice(7);
        const decoded = jsonwebtoken.verify(cookieMTSLCM, process.env.MTSLCM_ENCODER);
        const [resultUser] = await connection.query(queryUser, [decoded.user]);
        const [results] = await connection.query(query, [resultUser[0].UserID]);
        const status = results.length > 0;
        const statuslogin = !!decoded;

        res.render('tournaments.pug', { title: 'Torneos', results, status, statuslogin });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
};

const getDetailsTournaments = async (req, res) => {
    const tornoeID = req.params.id;
    const queryTournament = 'SELECT * FROM torneos WHERE TorneoID = ?';
    const queryRaces = 'SELECT * FROM carreras WHERE TorneoID = ?';
    const queryDriversAndNames = `
        SELECT participantes.UsuarioID, usuarios.NombreUsuario
        FROM participantes
        INNER JOIN usuarios ON participantes.UsuarioID = usuarios.userID
        WHERE participantes.TorneoID = ?
    `;

    try {
        const [[tournamentResult]] = await connection.query(queryTournament, [tornoeID]);
        const [racesResult] = await connection.query(queryRaces, [tornoeID]);
        const [driversAndNamesResult] = await connection.query(queryDriversAndNames, [tornoeID]);

        res.render('detailsTournaments',{ tournament: tournamentResult, races: racesResult, drivers: driversAndNamesResult });
        console.log({ tournament: tournamentResult, races: racesResult, drivers: driversAndNamesResult });
    } catch(error) {
        console.log(error);
        res.status(500).send("Error interno del servidor");
    }
};



export default { getAllTournaments, getTournamentsByCreator, getDetailsTournaments };
