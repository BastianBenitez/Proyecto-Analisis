import connection from '../config/connectionDB.js';
import jsonwebtoken from 'jsonwebtoken';
import authorization from '../middlewares/authorization.js';

const renderTournaments = (req, res) => res.status(200).render('tournaments.pug', { statuslogin: true, status: true });

const getAllTournaments = async (req, res) => {
    const query = "SELECT * FROM torneos";
    const validationToken = await authorization.tokenAuthorization(req);

    try {
        const [results] = await connection.query(query);
        const statuslogin = !!validationToken;
        return res.render('index.pug', { title: 'Torneos', results, statuslogin });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error interno del servidor');
    }
};

const getMyTournaments = async (req, res) => {
    const query = "SELECT * FROM torneos WHERE OrganizadorID = ? ORDER BY FechaInicio ASC";
    const userID = await authorization.getUserIDToken(req);
    
    try {
        const [results] = await connection.query(query, [userID.UserID]);
        const status = results.length > 0;

        return res.render('mytournaments.pug', { title: 'Torneos', results, status, statuslogin: true, url: '/tournament/mytournaments/'});
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error interno del servidor');
    }
};

const getIParticipateIn = async (req, res) => {
    const userID = await authorization.getUserIDToken(req);
    const query = 'SELECT TorneoID FROM participantes WHERE UsuarioID = ?';
    const queryTournament = 'SELECT * FROM torneos WHERE ';

    try{
        const [resultsID] = await connection.query(query, [userID.UserID])
        const tournamentIDs = resultsID.map(row => row.TorneoID);
        let condiciones = tournamentIDs.map(id => `TorneoID = ${id}`).join(' OR ');
        const consultaCompleta = queryTournament + condiciones;
        const [results] = await connection.query(consultaCompleta);
        
        const status = resultsID.length > 0;

        return res.render('mytournaments.pug', { title: 'Torneos', results, status, statuslogin: true, url: '/tournament/participate/'});
    }catch(error){
        console.log(error)
        return res.status(500).send('Error interno del servidor');
    }
}

const getDetailsTournament = async (req, res) => {
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
        const [[nameCapitan]] = await connection.query('SELECT NombreUsuario FROM usuarios WHERE UserID = ?', tournamentResult.OrganizadorID)

        return res.render('detailsTournaments.pug', { title: 'Torneos', tournament: tournamentResult, races: racesResult, drivers: driversAndNamesResult, nameCapitan, statuslogin: true });
    } catch(error) {
        console.log(error);
        return res.status(500).send("Error interno del servidor");
    }
};

export default { 
    getAllTournaments, 
    getMyTournaments, 
    getDetailsTournament,
    renderTournaments,
    getIParticipateIn
};
