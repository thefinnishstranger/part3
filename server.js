const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const path = require('path')

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('dist'))

if (process.argv.length < 3) {
  console.log('Usage: node server.js <password> [<name> <number>]');
  process.exit(1);
}

const password = process.argv[2];
const newName = process.argv[3];
const newNumber = process.argv[4];

const url = `mongodb+srv://nikolas:${password}@nikolasgustavson.uewwjz3.mongodb.net/?retryWrites=true&w=majority&appName=nikolasgustavson`;


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    validate: {
      validator: function(v) {
        return /\d{3}-\d{3}-\d{4}/.test(v)
      },
      msesage: props => `{props.value} is not a valid phone number!`
    },
    required: true 
  } 
});
const Contact = mongoose.model('Contact', contactSchema, 'contacts');

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');

    
    if (newName && newNumber) {
      const contact = new Contact({ name: newName, number: newNumber });
      return contact.save()
        .then(result => {
          console.log('Contact saved:', result);
        });
    } else {
      
      return Contact.find({})
        .then(result => {
          console.log('All contacts:');
          result.forEach(contact => {
            console.log(`Name: ${contact.name}, Number: ${contact.number}`);
          });
          ;
        ;
        });
    }
  })
  .catch(error => {
    console.error('Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  });


app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find({});
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).send('Error fetching contacts');
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
});


app.get('/api/contacts/:id', async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (contact) {
      res.json(contact);
    } else {
      res.status(404).end();
    }
  } catch (error) {
    next(error);
  }
});


app.post('/api/contacts', async (req, res, next) => {
  try {
    const { name, number } = req.body;

    if (!name || !number) {
      return res.status(400).json({ error: 'Name or number missing' });
    }

    const newContact = new Contact({ name, number });
    const savedContact = await newContact.save();
    res.json(savedContact);
  } catch (error) {
    next(error);
  }
});

app.put('/api/contacts/:id', async (req, res) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedContact);
  } catch (error) {
    res.status(500).send(error);
  }
});


app.delete('/api/contacts/:id', async (req, res, next) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(500).send(error);
  }
});

app.use(errorHandler)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
