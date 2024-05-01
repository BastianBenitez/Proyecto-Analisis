import connection from '../config/connectionDB.js';

const getDetailMyTeam = async (req, res) => {
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

const getMyTeams = async (req, res) => {
    const userID = req.params.id;
    const queryUser = 'SELECT EquipoID FROM miembros_equipo WHERE UsuarioID = ?';
    const queryTeam = 'SELECT Nombre, Descripcion FROM equipos WHERE ';

    try {
        const [userResult] = await connection.query(queryUser, [userID]);
        const equiposIDs = userResult.map(row => row.EquipoID);

        if (equiposIDs.length === 0) {
            res.status(404).send("El usuario no está asociado a ningún equipo.");
            return;
        }

        let condiciones = equiposIDs.map(id => `EquipoID = ${id}`).join(' OR ');
        const consultaCompleta = queryTeam + condiciones;

        const [teamResult] = await connection.query(consultaCompleta);
        res.send(teamResult);

    } catch (error) {
        console.log(error);
        res.status(500).send("Hubo un error al obtener los equipos del usuario.");
    }
};



export default { getMyTeams, getDetailMyTeam }