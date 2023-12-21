const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

mongoose.set('strictQuery', false)

const url = `mongodb+srv://EduardoCastro1201:${password}@cluster0.l2grzkw.mongodb.net/personApp?retryWrites=true&w=majority`

console.log('connecting to :', url)

mongoose
  .connect(url)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    validate: [
      {
        validator: function (v) {
          return /\d{2}-\d{6}/.test(v)
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
      {
        validator: function (v) {
          return /\d{3}-\d{8}/.test(v)
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    ],
    required: [true, 'User phone number required'],
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
