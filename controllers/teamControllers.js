import connection from '../config/connectionDB.js';
import authorization from '../middlewares/authorization.js';

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
        return res.status(200).render('myteams.pug', { teamDetail, statuslogin: true });
    }catch(error){
        console.log(error);
        return res.status(500).send("Hubo un error al obtener los equipos del usuario.");
    }
};

const getMyTeams = async (req, res) => {
    const userID = await authorization.getUserIDToken(req);
    const queryUser = 'SELECT EquipoID FROM miembros_equipo WHERE UsuarioID = ?';
    const queryTeam = 'SELECT EquipoID, Nombre, Descripcion FROM equipos WHERE ';

    try {
        const [userResult] = await connection.query(queryUser, [userID.UserID]);
        const equiposIDs = userResult.map(row => row.EquipoID);

        if (equiposIDs.length === 0) {
            return res.status(404).send("El usuario no está asociado a ningún equipo.");
        }

        let condiciones = equiposIDs.map(id => `EquipoID = ${id}`).join(' OR ');
        const consultaCompleta = queryTeam + condiciones;

        const [teamResult] = await connection.query(consultaCompleta);
        console.log(teamResult);
        return res.status(200).render('team', { teamResult , status: true, statuslogin: true });

    } catch (error) {
        console.log(error);
        return res.status(500).send("Hubo un error al obtener los equipos del usuario.");
    }
};

const creationNewTeam = async (req, res) => {

}

const editTeam = async (req, res) => {

}



export default { getMyTeams, getDetailMyTeam, creationNewTeam, editTeam }