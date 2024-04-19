import connection from '../config/connectionDB.js';

const getAllTournaments = (req, res)=>{
    const consulta = "SELECT torneosId, nombreTorneo, descripcion, DATE_FORMAT(fechaInicio, '%d de %M de %Y') AS fechaInicioLegible, DATE_FORMAT(fechaTermino, '%d de %M de %Y') AS fechaTerminoLegible, organizadorId, resultadoTorneo FROM torneos";
    connection.query(consulta, (error, results, fields)=>{
        if (error){
            console.error(error);
        }else{
            res.render('index.pug', {title: 'Torneos', results});
        }
    })
    
}

export default {getAllTournaments}