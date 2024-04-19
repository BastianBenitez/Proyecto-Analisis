
let cosas = [
    {id: 1, title: 'hola', buleano: true},
    {id: 2, title: 'que pasa', buleano: false},
]

const getUsers = (req, res)=>{
    res.render('index.pug', {title: 'Primera pagina', cosas})
}

export default {getUsers}