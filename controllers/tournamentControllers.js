import connection from '../config/connectionDB.js';
import jsonwebtoken from 'jsonwebtoken';

const getAllTournaments = async (req, res) => {
    const query = "SELECT torneosId, nombreTorneo, descripcion, DATE_FORMAT(fechaInicio, '%d de %M de %Y') AS fechaInicioLegible, DATE_FORMAT(fechaTermino, '%d de %M de %Y') AS fechaTerminoLegible, organizadorId, resultadoTorneo FROM torneos";
    
    try {
        const [results] = await connection.query(query);
        res.render('index.pug', { title: 'Torneos', results });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
};

const getTournamentsByCreator = async (req, res) => {
    const query = "SELECT torneosId, nombreTorneo, descripcion, DATE_FORMAT(fechaInicio, '%d de %M de %Y') AS fechaInicioLegible, DATE_FORMAT(fechaTermino, '%d de %M de %Y') AS fechaTerminoLegible, organizadorId, resultadoTorneo FROM torneos WHERE organizadorId = ? ORDER BY fechaInicio ASC";
    const queryuser = 'SELECT userId FROM usuarios WHERE userName = ?'
    let status;

    const cookieMTSLCM = req.headers.cookie.split('; ').find(cookie => cookie.startsWith('MTSLCM=')).slice(7);
    const decoded = jsonwebtoken.verify(cookieMTSLCM, process.env.MTSLCM_ENCODER);

    try {
        
        const [resultuser] = await connection.query(queryuser, [decoded.user]);
        const [results] = await connection.query(query, [resultuser[0].userId]);
        if (results.length === 0) {
            status = false
        }else{
            status = true
        }
        console.log(status)
        res.render('tournaments.pug', { title: 'Torneos', results, status });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
}

export default { getAllTournaments, getTournamentsByCreator };
