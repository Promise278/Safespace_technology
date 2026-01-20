const express = require('express')
const app = express();
const cors = require('cors')
const authRoutes = require("./routes/auth.routes")
const storyRoutes =require("./routes/story.routes");
const connection = require('./config/connection');

app.use(express.json())
app.use(cors());
const PORT = process.env.PORT;

app.get('/',(req, res) => {
    console.log("Welcome to the page")
    res.send("Welcome to our homepage")
})


app.use('/auth', authRoutes)
app.use('/stories', storyRoutes)

connection.sync({ force: false, alter: false }).then(async() => {
    app.listen(PORT, () => {
        console.log(`Database Connected Successfully and Server running on port ${PORT}`)
    })
}).catch((e) => {
    console.log(`Database connection failed ${e}`)
});