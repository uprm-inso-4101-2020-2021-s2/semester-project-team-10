const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const {Prohairesis} = require("Prohairesis");
const bodyParser = require("body-parser");

dotenv.config({ path: './.env'})

const app = express();
const database = new Prohairesis("mysql://be3800dd31540b:17967a93@us-cdbr-east-03.cleardb.com/heroku_cc4f88e5de0ff25?reconnect=true")

app
    .use(bodyParser.urlencoded({extended: false}))
    .use(bodyParser.json())

    //registering new user
    .post("/register", async(req,res) => {
        const {name, email, password} = req.body;

        try {
            const user = await database.query(`
                INSERT INTO users(
                    name,
                    email,
                    password
                ) VALUES (
                    @name,
                    @email,
                    @password
                )                    
                `,{
                    name,
                    email,
                    password
                });

                res.status(200);
                res.end('Added user');
            } catch (e) {
                console.error('Error adding user');
                res.status(500);
                res.end('Error adding user. Does this user exist already?');
            }
        })

    //logging in
    .put("/", async(req,res) => {
        const {name, email, password} = req.body;

        try {
            const user = await database.query(`
                SELECT * FROM users
                    WHERE name = @name
                    AND password = SHA2(@password,256)`,
                {
                    name,
                    email,
                    password,
                });

                res.status(200);
                res.end('User exists');
            } catch (e) {
                console.error('Error adding user');
                res.status(500);
                res.end('Error finding user. Does this user exist?');
            }
        })
    
    //Find a user
    .get("/", async(req,res) => {
        //we may add anything here

        try {
            //below will get an array of users
            const users = await database.query(`
                SELECT
                    name,
                FROM
                    users
                `);

                res.status(200);
                res.json(users);
            } catch (e) {
                console.error('Error retrieving users');
                res.status(500);
                res.end('Error finding users. Does this user exist?');
            }
        })    


const publicDirectory = path.join(__dirname, './public');

app.set('view engine', 'hbs');

app.use(express.static(publicDirectory));
//This is where the GET and POST will be located

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
    //res.render("index");
});

app.listen(process.env.PORT || 8080, function(){
    console.log("Server is Running 8080");
});