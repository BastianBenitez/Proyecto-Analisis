import connection from '../config/connectionDB.js';
import jsonwebtoken from 'jsonwebtoken';
import authorization from '../middlewares/authorization.js';
import { query } from 'express';

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

        return res.render('./tournament/mytournaments.pug', { title: 'Torneos', results, owner:true, status, statuslogin: true, history: false,url: '/tournament/mytournaments/'});
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
        const consultaCompleta = queryTournament + condiciones + ' AND FechaTermino < CURRENT_DATE';
        const [results] = await connection.query(consultaCompleta);
        
        const status = resultsID.length > 0;

        return res.render('./tournament/mytournaments.pug', { title: 'Torneos', results, status, statuslogin: true, history: false, url: '/tournament/participate/'});
    }catch(error){
        console.log(error)
        return res.status(500).send('Error interno del servidor');
    }
}

const getDetailsTournament = async (req, res) => {
    let Owner = false;
    const torneoID = req.params.id;
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
        const [[tournamentResult]] = await connection.query(queryTournament, [torneoID]);
        const [racesResult] = await connection.query(queryRaces, [torneoID]);
        const [driversAndNamesResult] = await connection.query(queryDriversAndNames, [torneoID]);
        const [[nameCapitan]] = await connection.query('SELECT UserID, NombreUsuario FROM usuarios WHERE UserID = ?', tournamentResult.OrganizadorID)
        let registed = false;
        
        if (nameCapitan.UserID == userID.UserID) Owner = true;
        const [[count]] = await connection.query("SELECT COUNT(*) AS count FROM participantes WHERE UsuarioID  = ? AND TorneoID = ?", [userID.UserID, torneoID]);
        if (count.count === 1) registed = true;

        return res.render('./tournament/detailsTournaments.pug', { title: 'Torneos', registed, tournament: tournamentResult, races: racesResult, drivers: driversAndNamesResult, nameCapitan: nameCapitan.NombreUsuario, statuslogin: true, Owner });
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
        return res.status(201).json({ success: true, message: 'Carrera ingresada correctamente', redirect: "/tournament/mytournaments/" + torneoID });
    }catch(error){
        console.log(error);
        return res.status(500).send('Error interno del servidor');
    }
}

const joinTournamenent = async (req, res) => {
    const torneoID = req.params.id;
    const userID = await authorization.getUserIDToken(req);
    const query = 'INSERT INTO participantes (UsuarioID, TorneoID) VALUES(?,?)';

    try{  
        const [[count]] = await connection.query("SELECT COUNT(*) AS count FROM participantes WHERE UsuarioID  = ? AND TorneoID = ?", [userID.UserID, torneoID]);
        if (count.count === 1) {
            return res.redirect('/')
        }

        await connection.query(query, [userID.UserID, torneoID])
        return res.redirect('/tournament/participate/'+ torneoID)
        
    }catch(error){
        console.log(error);
        return res.status(500).send('Error interno del servidor');
    }
}

const getHistory = async (req, res) => {
    const userID = await authorization.getUserIDToken(req);
    const query = 'SELECT TorneoID FROM participantes WHERE UsuarioID = ?';
    const queryTournament = 'SELECT * FROM torneos WHERE ';

    try{
        const [resultsID] = await connection.query(query, [userID.UserID])
        const tournamentIDs = resultsID.map(row => row.TorneoID);
        let condiciones = tournamentIDs.map(id => `TorneoID = ${id}`).join(' OR ');
        const consultaCompleta = queryTournament + condiciones + ' AND FechaTermino < CURRENT_DATE';
        const [results] = await connection.query(consultaCompleta);
        
        const status = resultsID.length > 0;

        return res.render('./tournament/mytournaments.pug', { title: 'Torneos', results, status, statuslogin: true, history: true, url: '/tournament/participate/'});
    }catch(error){
        console.log(error)
        return res.status(500).send('Error interno del servidor');
    }
}

const deleteTournament = async (req, res) => {
    const torneoID = req.params.id
    const queryDeleteTorunament = 'DELETE FROM torneos WHERE TorneoID = ?';
    const queryDeleteRace = 'DELETE FROM carreras WHERE TorneoID = ?';
    const queryDeleteParticipate = 'DELETE FROM participantes WHERE TorneoID = ?'

    try{
        connection.query(queryDeleteRace, [torneoID]);
        connection.query(queryDeleteParticipate, [torneoID]);
        connection.query(queryDeleteTorunament, [torneoID]);
        res.redirect('/tournament/mytournaments');
    }catch (error) {
        console.log(error);
        return res.status(500).send('Error interno del servidor');
    }
}

const renderEditTournament = async (req, res) => {
    const torneoID = req.params.id;
    req.session.torneoID = torneoID;
    const query = 'SELECT NombreTorneo, Descripcion, FechaInicio, FechaTermino, ResultadoTorneo FROM torneos WHERE TorneoID = ? ';

    try{
        const [[results]] =  await connection.query(query, [torneoID])
        results.FechaInicio = results.FechaInicio.toISOString().split('T')[0];
        results.FechaTermino = results.FechaTermino.toISOString().split('T')[0];
        console.log(results)
        return res.status(200).render('./tournament/edittournament.pug', { results, status: true, statuslogin: true });

    }catch (error) {
        console.log(error);
        return res.status(500).send('Error interno del servidor');
    }
}

const editTournament = async (req, res) => {
    const torneoID = req.session.torneoID;
    if (!torneoID) {
        return res.status(400).json({ success: false, message: 'ID de torneo no válido' });
    }

    const { name, description, datestart, datefinish, result } = req.body;
    const query = 'UPDATE torneos SET NombreTorneo = ?, Descripcion = ?, FechaInicio = ?, FechaTermino = ?, ResultadoTorneo= ? WHERE TorneoID = ?' ;

    try {
        await connection.query(query, [name, description, datestart, datefinish, result, torneoID])
        return res.status(201).json({ success: true, message: 'Datos Actualizados', redirect: "/tournament/mytournaments/" + torneoID });
    } catch (error) {
        console.log(error);
        return res.status(500).send('Error interno del servidor');
    }
}

const deleteRace = async (req, res) => {
    const raceID = req.params.id;
    const query = 'DELETE FROM carreras WHERE CarreraID = ?'; 

    try{
        await connection.query(query, [raceID])
        return res.redirect('/tournament/mytournaments')
    } catch (error) {
        console.log(error);
        return res.status(500).send('Error interno del servidor');
    }
}

const deleteDriver = async (req, res) => {
    const driverID = req.params.id;
    const query = 'DELETE FROM participantes WHERE UsuarioID = ?'; 

    try{
        await connection.query(query, [driverID])
        return res.redirect('/tournament/mytournaments')
    } catch (error) {
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
    addRace,
    joinTournamenent,
    getHistory,
    deleteTournament,
    editTournament,
    renderEditTournament,
    deleteRace,
    deleteDriver
};
