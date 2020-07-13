const mongoose = require('mongoose');



if (process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
}

const password = process.argv[2]
const url =
    `mongodb+srv://admin:${password}@personal.lqv6u.mongodb.net/phonebook-app?retryWrites=true&w=majority`
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })


const phoneBookSchema = new mongoose.Schema({
    name: String,
    number: Number,
})

const PhoneBook = mongoose.model('PhoneBook', phoneBookSchema)

if (process.argv.length === 5){
    const phoneBook = new PhoneBook({
        name: process.argv[3],
        number: process.argv[4]
    })

    phoneBook.save().then(result => {
        console.log('record successfully added, new data added is:', result)
        mongoose.connection.close()
    })
}

if (process.argv.length === 3){
    PhoneBook.find({}).then(result => {
        // result.forEach(item => {
        //     console.log(item)
        // })
        console.log(result)
        mongoose.connection.close()
    })
}

