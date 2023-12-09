const http = require("http");
const express = require("express");
const { countReset } = require("console");
var morgan = require("morgan");
const cors = require("cors");

const app = express();

morgan.token("dataName", function getBody(req) {
  return req.body.name;
});

morgan.token("dataNumber", function getBody(req) {
  return req.body.number;
});

app.use(express.json());
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms {"name:" ":dataName" "number:" ":dataNumber"}'
  )
);
app.use(cors());

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

function countPeople() {
  let numPeople = persons.length;
  return numPeople;
}

function getDate() {
  let date = new Date();
  return date;
}
app.get("/info", (request, response) => {
  response.send(
    `<div>
    <p>Phonebook has info for ${countPeople()} people</p>
    <p>${getDate()}</p>
  </div>`
  );
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

function generateId() {
  return Math.floor(Math.random() * 1000000);
}

app.post("/api/persons", (request, response) => {
  const body = request.body;
  if (!body.name) {
    return response.status(400).json({
      error: "Name missing",
    });
  }

  if (!body.number) {
    return response.status(400).json({
      error: "Number missing",
    });
  }

  persons.map((person) => {
    if (person.name === body.name) {
      return response.status(400).json({
        error: "name must be unique",
      });
    }
  });

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };

  persons = persons.concat(person);

  response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
