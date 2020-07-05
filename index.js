const morgan = require('morgan');
const express = require('express');
const cors = require('cors')
const app = express();

app.use(express.static('build'))
app.use(cors())
app.use(express.json())


const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}
app.use(requestLogger);

morgan.token('body', (req, res) =>{
    return JSON.stringify(req.body);
})

let records = {
    "persons": [
        {
            "name": "Ada Lovelace",
            "number": "39-44-5323523",
            "id": 2
        },
        {
            "name": "Dan Abramov",
            "number": "12-43-234345",
            "id": 3
        },
        {
            "name": "Pancho Villa",
            "number": 6674745541,
            "id": 6
        },
        {
            "name": "Carlos Rivera",
            "number": 6671454123,
            "id": 7
        },
        {
            "name": "Ricardo Lopez",
            "number": 6671772219,
            "id": 9
        },
        {
            "name": "DanielRo",
            "number": 6671214450,
            "id": 11
        },
        {
            "name": "marioSsexo",
            "number": 6671218810,
            "id": 12
        }
    ]
}

app.get('/api/persons', (request, response) =>{
    response.json(records);
})

app.get('/info', (req, response) =>{

    response.send(`<h2>Phonebook has info for ${records.persons.length} people </h2><div>${new Date()}</div>`)
})

app.get('/api/persons/:id', (req, response) =>{
   const id = Number(req.params.id);
   const person = records.persons.find(person => person.id === id);
   if (person){
       response.json(person);
   }
   return response.status(404).send('<h3>error: person with that id was not found</h3>').end()

})

app.delete('/api/persons/:id', (req, res) =>{
    const id = Number(req.params.id);
    records.persons = records.persons.filter(person => person.id !== id);
    res.status(204).end()

})

const generateId = () => {
    const maxId = records.persons.length > 0
        ? Math.max(...records.persons.map(n => n.id))
        : 0
    return maxId + 1
}

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.post('/api/persons', (req, res) =>{
    const body = req.body;

    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'content missing'
        })
    }
    if (records.persons.filter(person => person.name === body.name).length){
        return res.status(409).json({
            error: `'${body.name}' already exists, new name must be unique`
        })
    }

    const newRecord = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    records.persons = records.persons.concat(newRecord);
    res.json(newRecord);
})
app.get('/api/test', (req, res) =>{
    const result = records.persons.filter(person => person.name === 'chirino');
    res.status(200).send(result)
})
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3002

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})