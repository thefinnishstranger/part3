const mongoose = require('mongoose');

if (process.argv.length < 2) {
  console.log('Usage: node mongo.js <password> <name> <number>');
  process.exit(1);
}

const password = process.argv[2];
const newName = process.argv[3];
const newNumber = process.argv[4];

const url = `mongodb+srv://nikolas:${password}@nikolasgustavson.uewwjz3.mongodb.net/?retryWrites=true&w=majority&appName=nikolasgustavson`;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => { // Mark the callback function as async
    console.log('Connected to MongoDB');
    const contactSchema = new mongoose.Schema({
      name: String,
      number: String
    });

    const Contact = mongoose.model('Contact', contactSchema);

    if (!newName && !newNumber) {

      return Contact.find({})
      .then(result => {
        result.forEach(contact => {
          console.log(`Name: ${contact.name}, Number: ${contact.number}`)
        })
        mongoose.connection.close()
      })
    } else {
      const contact = new Contact({ name: newName, number: newNumber });
      const result = await contact.save();
      console.log('Contact saved:', result);
    }

    mongoose.connection.close();
  })
  .catch(error => {
    console.error('Error:', error.message);
    mongoose.connection.close();
  });
