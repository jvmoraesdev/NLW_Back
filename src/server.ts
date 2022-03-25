import express, { request, response } from 'express';


const app = express();

app.use(express.json());

//Rota: Endereço completo da requisição
//Recurso: Qual entidade estamos acessando do sistema

//GET: buscar uma ou mais informações do back-end
//POST: criar uma nova informação no back-end
//PUT: atualizar uma informação exitente no back-end
//DELETE: remover uma informação do back-end

//Request Param: Parâmetros que vem na própria rota que identiicam um recurso
//Query Param: Parâmetros que vem na rota também que geralmente opcionais ara filtro
//Request Body: Parâmetros para a criação e atualização de informações

const users = [
    'Eu',
    'Voce',
    'Dois filhos',
    'e um cachorro',
    'sla'
];

app.get('/users', (request, response) => {
    const search = String(request.query.search);

    const filteredUsers = search ? users.filter(user => user.includes(search)) : users;

    //  JSON
    response.json(filteredUsers);
});

app.get('/users/:id', (request, response) => {
    const id = Number(request.params.id);

    const user = users[id];

    return response.json(user);
});

app.post('/users', (request, response) => {
    const data = request.body;

    const user = {
        name: data.name,
        email: data.email
    };

    return response.json(user);
})


app.listen(3333);