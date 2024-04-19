import connection from './connectionDB.js';

const getUsers = (req, res)=>{
    const consulta = 'SELECT * FROM usuarios';
    connection.query(consulta, (error, results, fields)=>{
        if (error){
            console.error(error);
        }else{
            res.render('index.pug', {title: 'Torneo', results});
        }
    })
    
}

export default {getUsers}