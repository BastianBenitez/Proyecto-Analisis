import connection from '../config/connectionDB.js';

const getDetailMyTeam = async (req, res) =>{
    const teamID = req.params.id;
    const query = 'SELECT * FROM equipos WHERE EquipoID = ?';

    try{
        const [[teamResult]] = await connection.query(query, [teamID]);
        
        const captainQuery = 'SELECT NombreUsuario FROM usuarios WHERE UserID = ?';
        const [[captainResult]] = await connection.query(captainQuery, [teamResult.CapitanID]);
        
        const teamDetail = {
            ...teamResult,
            Capitan: captainResult.NombreUsuario
        };
        res.send(teamDetail);
    }catch(error){
        console.log(error);
    }
};


export default { getDetailMyTeam }