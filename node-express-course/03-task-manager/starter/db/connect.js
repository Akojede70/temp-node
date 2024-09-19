const mongoose = require("mongoose")

const connectDB = (url) => {
    return mongoose.connect(url, {
        // to avoide warning at the console
        useNewUrlParser: true,
        useCreateIndex: true, 
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
}

module.exports = connectDB;