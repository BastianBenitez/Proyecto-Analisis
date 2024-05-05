import connection from '../config/connectionDB.js';
import jsonwebtoken from 'jsonwebtoken';
import authorization from '../middlewares/authorization.js';

const noHTML = str => !/<[a-z][\s\S]*>/i.test(str);

const renderTournaments = (req, res) => res.status(200).render('./tournament/tournaments.pug', { statuslogin: true, status: true });

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

        return res.render('./tournament/mytournaments.pug', { title: 'Torneos', results, status, statuslogin: true, url: '/tournament/mytournaments/'});
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

        return res.render('./tournament/mytournaments.pug', { title: 'Torneos', results, status, statuslogin: true, url: '/tournament/participate/'});
    }catch(error){
        console.log(error)
        return res.status(500).send('Error interno del servidor');
    }
}

const getDetailsTournament = async (req, res) => {
    let Owner = false;
    const tornoeID = req.params.id;
    const userID = await authorization.getUserIDToken(req);
    const queryTournament = 'SELECT * FROM torneos WHERE TorneoID = ?';
    const queryRaces = 'SELECT * FROM carreras WHERE TorneoID = ? ORDER BY Fecha ASC';
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
        const [[nameCapitan]] = await connection.query('SELECT UserID, NombreUsuario FROM usuarios WHERE UserID = ?', tournamentResult.OrganizadorID)
        
        if (nameCapitan.UserID == userID.UserID) Owner = true;

        return res.render('./tournament/detailsTournaments.pug', { title: 'Torneos', tournament: tournamentResult, races: racesResult, drivers: driversAndNamesResult, nameCapitan: nameCapitan.NombreUsuario, statuslogin: true, Owner });
    } catch(error) {
        console.log(error);
        return res.status(500).send("Error interno del servidor");
    }
};

const renderNewTournaments = (req, res) => res.status(200).render('./tournament/newtournament.pug', { statuslogin: true, status: true });

const creationNewTournament = async (req, res) =>{
    const userID = await authorization.getUserIDToken(req);
    const { name, description, dateStart, dateFinish } = req.body
    const query = 'INSERT INTO torneos (NombreTorneo, Descripcion, FechaInicio, FechaTermino, OrganizadorID) VALUES(?, ?, ?, ?, ?)';
    
    if (!name || !description || !dateStart || !dateFinish) {
        return res.status(400).json({ success: false, message: 'Todos los campos deben de estar completados' });
    } else if (name.length > 15) {
        return res.status(400).json({ success: false, message: 'El nombre no puede tener una logitud superor a 15 caracteres' });
    }else if(!noHTML(name) || !noHTML(description)){
        return res.status(400).json({ success: false, message: 'Nombre o descripcion no validos' });
    }

    try{
        const [results] = await connection.query(query, [name, description, dateStart, dateFinish, userID.UserID])
        return res.status(200).json({ success: true, message: 'Registro completado', redirect: `/tournament/mytournaments/${results.insertId}`});
    }catch(error){
        console.log(error);
        return res.status(500).send('Error interno del servidor');
    }
}

const renderAddRace = async (req, res) => {
    const query = 'SELECT NombrePista FROM pistas';
    const torneoID = req.params.id;
    console.log(torneoID)
    
    try{
        const [results] = await connection.query(query)
        return res.status(200).render('./tournament/addrace.pug', { torneoID, pistas: results, statuslogin: true, status: true });
    }catch(error){
        console.log(error);
        return res.status(500).send('Error interno del servidor');
    }
}

const addRace = async (req, res) => {
    const { torneoID, tackName, raceDuration, racecondition, dateStart } = req.body
    const query = 'INSERT INTO carreras (TorneoID, PistaID, DuracionCarrera, Condiciones, Fecha) VALUES(?,?,?,?,?)';
    const queryTracks = 'SELECT PistaID FROM pistas WHERE NombrePista = ?';

    try{
        const [[trackID]] = await connection.query(queryTracks, [tackName]) 
        await connection.query(query, [torneoID, trackID.PistaID, raceDuration, racecondition, dateStart])
    }catch(error){
        console.log(error);
        return res.status(500).send('Error interno del servidor');
    }
}

export default { 
    getAllTournaments, 
    getMyTournaments, 
    getDetailsTournament,
    renderTournaments,
    getIParticipateIn,
    renderNewTournaments,
    creationNewTournament,
    renderAddRace,
    addRace
};
