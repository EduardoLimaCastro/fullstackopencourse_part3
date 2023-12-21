const express = require('express')
require('dotenv').config()
var morgan = require('morgan')
const cors = require('cors')
const app = express()

const Person = require('./models/people')

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(express.json())
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms {"name:" ":dataName" "number:" ":dataNumber"}'
  )
)
app.use(cors())
app.use(express.static('dist'))

morgan.token('dataName', function getBody(req) {
  return req.body.name
})

morgan.token('dataNumber', function getBody(req) {
  return req.body.number
})

// let persons = [
//   {
//     id: 1,
//     name: "Arto Hellas",
//     number: "040-123456",
//   },
//   {
//     id: 2,
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//   },
//   {
//     id: 3,
//     name: "Dan Abramov",
//     number: "12-43-234345",
//   },
//   {
//     id: 4,
//     name: "Mary Poppendieck",
//     number: "39-23-6423122",
//   },
// ];

function countPeople() {
  Person.countDocuments({})
    .then((count) => {
      console.log(count)
      return count
    })
    .catch((err) => {
      console.error(err)
    })
    .finally(() => {})
}

function getDate() {
  let date = new Date()
  return date
}

app.get('/info', (request, response) => {
  response.send(
    `<div>
    <p>Phonebook has info for ${countPeople()} people</p>
    <p>${getDate()}</p>
  </div>`
  )
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then((person) => {
    response.json(person)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

function generateId() {
  return Math.floor(Math.random() * 1000000)
}

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.number) {
    return response.status(400).json({
      error: 'Number missing',
    })
  }

  // persons.map((person) => {
  //   if (person.name === body.name) {
  //     return response.status(400).json({
  //       error: "name must be unique",
  //     });
  //   }
  // });

  if (body.name === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
    id: generateId(),
  })

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    {
      new: true,
      runValidators: true,
      context: 'query',
      returnDocument: 'after',
    }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson)
    })
    .catch((error) => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`)
})
