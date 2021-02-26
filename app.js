const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config({ path: './.env'})

const app = express();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

const publicDirectory = path.join(__dirname, './public');

app.set('view engine', 'hbs');

db.connect( (error) => {
    if(error){
        console.log(error)
    } else{
        console.log("MySQL Connected...")
    }
})

app.use(express.static(publicDirectory));
//This is where the GET and POST will be located

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
    //res.render("index");
});

app.listen(process.env.PORT || 8080, function(){
    console.log("Server is Running 8080");
});