require('dotenv').config()
require('express-async-errors');
const express = require('express')
const app = express();
const connectDB = require('./db/connect');
const notFoundMiddleware = require('./middleware/not-found')
const errorMiddleware = require('./middleware/error-handler');
const productRouter = require('./routes/products')
const PORT = process.env.PORT || 3000;
//middleware
app.use(express.json());

//route

app.get('/', (req, res) => {
    res.send('<h1>Store API</h1><a href="/api/v1/products"> Product route </a>');
})

app.use('/api/v1/products', productRouter);
//Product route
app.use(notFoundMiddleware);
app.use(errorMiddleware);

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(PORT, console.log(`Connected to DB and server is listening at ${PORT}`));
    } catch (error) {
        console.log(error);
    }
}

start();