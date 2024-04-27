import connection from '../config/connectionDB.js';
import jsonwebtoken from 'jsonwebtoken';
import authorization from '../middlewares/authorization.js';

const getAllTournaments = async (req, res) => {
    const query = "SELECT TorneoId, NombreTorneo, Descripcion, DATE_FORMAT(FechaInicio, '%d de %M de %Y') AS fechaInicioLegible, DATE_FORMAT(FechaTermino, '%d de %M de %Y') AS fechaTerminoLegible, OrganizadorID, ResultadoTorneo FROM torneos";
    const validationtoken = await authorization.tokenAuthorization(req);

    
    try {
        const [results] = await connection.query(query);
        if (!validationtoken){
            return res.render('index.pug', { title: 'Torneos', results, statuslogin: false });
        }
        return res.render('index.pug', { title: 'Torneos', results, statuslogin: true });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error interno del servidor');
    }
};

const getTournamentsByCreator = async (req, res) => {
    const query = "SELECT TorneoId, NombreTorneo, Descripcion, DATE_FORMAT(FechaInicio, '%d de %M de %Y') AS fechaInicioLegible, DATE_FORMAT(FechaTermino, '%d de %M de %Y') AS fechaTerminoLegible, OrganizadorId, ResultadoTorneo FROM torneos WHERE OrganizadorID = ? ORDER BY FechaInicio ASC";
    const queryuser = 'SELECT UserID FROM usuarios WHERE NombreUsuario = ?'
    let statuslogin;

    const cookieMTSLCM = req.headers.cookie.split('; ').find(cookie => cookie.startsWith('MTSLCM=')).slice(7);
    const decoded = jsonwebtoken.verify(cookieMTSLCM, process.env.MTSLCM_ENCODER);

    try {
        const [resultuser] = await connection.query(queryuser, [decoded.user]);
        const [results] = await connection.query(query, [resultuser[0].UserID]);
        if (results.length === 0) {
            statuslogin = true
        }else{
            statuslogin = false
        }
        res.render('tournaments.pug', { title: 'Torneos', results, statuslogin });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
}

export default { getAllTournaments, getTournamentsByCreator };
