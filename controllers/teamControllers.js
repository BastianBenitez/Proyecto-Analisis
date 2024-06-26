import { crossOriginResourcePolicy } from 'helmet';
import connection from '../config/connectionDB.js';
import authorization from '../middlewares/authorization.js';

const noHTML = str => !/<[a-z][\s\S]*>/i.test(str);

const teamRender = (req, res) => {
    try{
        return res.status(200).render('./team/team.pug', { status: true, statuslogin: true })
    }catch(error){
        console.log(error)
        return res.status(500).send("Hubo un error al obtener los equipos del usuario.");
    }
}

const getDetailTeam = async (req, res) => {
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
        
        return res.status(200).render('./team/myteamdetails.pug', { teamDetail, status: true, statuslogin: true });
    }catch(error){
        console.log(error);
        return res.status(500).send("Hubo un error al obtener los equipos del usuario.");
    }
};

const getIParticipateIn = async (req, res) => {
    const userID = await authorization.getUserIDToken(req);
    const queryUser = 'SELECT EquipoID FROM miembros_equipo WHERE UsuarioID = ?';
    const queryTeam = 'SELECT EquipoID, Nombre, Descripcion FROM equipos WHERE ';

    try {
        const [userResult] = await connection.query(queryUser, [userID.UserID]);
        const equiposIDs = userResult.map(row => row.EquipoID);

        if (equiposIDs.length === 0) {
            return res.status(404).send("El usuario no está asociado a ningún equipo.");
        };

        let condiciones = equiposIDs.map(id => `EquipoID = ${id}`).join(' OR ');
        const consultaCompleta = queryTeam + condiciones;

        const [teamResult] = await connection.query(consultaCompleta);
        return res.status(200).render('./team/myteam.pug', { teamResult , status: true, statuslogin: true });

    } catch (error) {
        console.log(error);
        return res.status(500).send("Hubo un error al obtener los equipos del usuario.");
    }
};

const getMyTeams = async (req, res) => {
    const userID = await authorization.getUserIDToken(req);
    const query = 'SELECT * FROM equipos WHERE CapitanID = ?';
    const queryTeam = 'SELECT EquipoID, Nombre, Descripcion FROM equipos WHERE ';

    try {
        const [Result] = await connection.query(query, [userID.UserID]);
        const equiposIDs = Result.map(row => row.EquipoID);

        if (equiposIDs.length === 0) {
            return res.status(404).send("El usuario no está asociado a ningún equipo.");
        };

        let condiciones = equiposIDs.map(id => `EquipoID = ${id}`).join(' OR ');
        const consultaCompleta = queryTeam + condiciones;

        const [teamResult] = await connection.query(consultaCompleta);
        return res.status(200).render('./team/myteam.pug', { teamResult, owner: true,status: true, statuslogin: true });

    } catch (error) {
        console.log(error);
        return res.status(500).send("Hubo un error al obtener los equipos del usuario.");
    }
}

const creationNewTeamRender = (req, res) => res.status(200).render('./team/createNewTeam.pug', { status: true, statuslogin: true });

const creationNewTeam = async (req, res) => {
    const { name, description } = req.body

    if (!name || !description) {
        return res.status(400).json({ success: false, message: 'Todos los campos deben de estar completados' });
    } else if (name.length > 15) {
        return res.status(400).json({ success: false, message: 'El nombre no puede tener una logitud superor a 15 caracteres' });
    }else if(!noHTML(name) || !noHTML(description)){
        return res.status(400).json({ success: false, message: 'Nombre o descripcion no validos' });
    }

    const userID = await authorization.getUserIDToken(req);
    const query = 'INSERT INTO equipos (Nombre, Descripcion, CapitanID) VALUES (?, ?, ?)';

    try{
        const [nameCount] = await connection.query("SELECT COUNT(*) AS count FROM equipos WHERE Nombre = ?", [name]);
        if (nameCount[0].count === 1) return res.status(400).json({ success: false, message: 'El nombre del equipo ya está registrado' });

        await connection.query(query, [name, description, userID.UserID] )
        return res.status(200).json({ success: true, message: 'Registro completado', redirect: '/team/myteam' });
    }catch(erorr){
        console.log(erorr);
        return res.status(500).send("Hubo un error al obtener los equipos del usuario.");
    }
};

const deleteTeam = async (req, res) => {
    const equipoID = req.params.id;
    const queryDeleteTeam = 'DELETE FROM equipos WHERE EquipoID = ?';
    const queryDeleteMember = 'DELETE FROM miembros_equipo WHERE EquipoID = ?';
    const queryDeleteParticipe = 'DELETE FROM participacion_equipo WHERE EquipoID = ?';

    try{
        connection.query(queryDeleteParticipe, [equipoID]);
        connection.query(queryDeleteMember, [equipoID]);
        connection.query(queryDeleteTeam, [equipoID]);
        res.redirect('/team/myteam/');
    } catch (erorr) {
        console.log(error);
        return res.status(500).send("Hubo un error en el servidor");
    }
}

const renderEditTeam = async (req, res) => {
    const equipoID = req.params.id;
    req.session.equipoID = equipoID;
    const query = 'SELECT Nombre, Descripcion FROM equipos WHERE EquipoID = ? ';
    try {
        const [[results]] = await connection.query(query, [equipoID]);
        console.log(results);
        return res.status(200).render('./team/editteam', { results, status: true, statuslogin: true });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Hubo un error en el servidor");
    }
}


const editTeam = async (req, res) => {
    const equipoID = req.session.equipoID;
    const { name, description } = req.body;
    const query = 'UPDATE equipos SET Nombre = ?, Descripcion = ? WHERE EquipoID = ? ';

    try {
        await connection.query(query, [name, description, equipoID])
        return res.status(201).json({ success: true, message: 'Datos Actualizados', redirect: "/team/myteam" });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Hubo un error en el servidor");
    }
}


export default { 
    getMyTeams, 
    getDetailTeam, 
    creationNewTeam, 
    deleteTeam, 
    creationNewTeamRender,
    teamRender,
    getIParticipateIn,
    editTeam,
    renderEditTeam
}