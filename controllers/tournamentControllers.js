import connection from '../config/connectionDB.js';

const getAllTournaments = async (req, res) => {
    const consulta = "SELECT torneosId, nombreTorneo, descripcion, DATE_FORMAT(fechaInicio, '%d de %M de %Y') AS fechaInicioLegible, DATE_FORMAT(fechaTermino, '%d de %M de %Y') AS fechaTerminoLegible, organizadorId, resultadoTorneo FROM torneos";
    
    try {
        const [results, fields] = await connection.query(consulta);
        res.render('index.pug', { title: 'Torneos', results });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
};

export default { getAllTournaments };
