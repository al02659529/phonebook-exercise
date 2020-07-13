require('dotenv').config()
const PhoneBook = require('./models/phonebook');
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
// get all records - done
app.get('/api/persons', (request, response) =>{
    PhoneBook.find({}).then(data =>{
        response.json(data)
    }).catch(err =>{
        console.log(err)
    })
})
// gets the number of documents in the page and shows it on the info section
app.get('/info', (req, response, next) =>{
    PhoneBook.countDocuments({})
        .then(res => {
        console.log("count query, number of documents: ", res)
        response.send(`<h2>Phonebook has info for ${res} people </h2><div>${new Date()}</div>`)
    })
        .catch(err =>{next(err)})
})

// get specific person by ID - DONE
app.get('/api/persons/:id', (req, response, next) =>{
    PhoneBook.findById(req.params.id).then(record =>{
        response.json(record)
    }).catch(err => next(err))

   // return response.status(404).send('<h3>error: person with that id was not found</h3>').end()

})

//remove specific person by ID - done
app.delete('/api/persons/:id', (req, res, next) =>{
    PhoneBook.findByIdAndRemove(req.params.id)
        .then(result => {
            console.log("removed entry:", result)
            res.status(204).end()})
        .catch(err => next(err))
})


app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
// get all records - done
app.post('/api/persons', (req, res, next) =>{
    const body = req.body;

    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'content missing'
        })
    }
    const newRecord = new PhoneBook({
        name: body.name,
        number: body.number.toString()
    })
    // only adds record if name is unique
    PhoneBook.exists({name: body.name}).then(record =>{
        if (record === true){
            res.status(409).json({
                error: "name must be unique"
            }).end()
            return
        }
        newRecord.save().then(result => {
            console.log('record successfully added, new data added is:', result)
            res.json(result)
        }).catch(err => {
            next(err)
        })
    }).catch(err => {
       next(err)
    })





})
// updates phone number of a given ID record - done
app.put('/api/persons/:id', (req, res, next) =>{
    PhoneBook.findByIdAndUpdate(req.params.id, {number: req.body.number}).then(result =>{
        console.log("response", result)
        res.status(201).end()
    }).catch(err => next(err))
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)


const errorHandler = (error, request, response, next) => {
    console.error("error name: ", error.name)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }else if(error.name === 'ValidationError'){
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} `)
})
