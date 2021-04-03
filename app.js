if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}   
//Page Description: This is the file for the rest API

const express = require("express"); //import express and
const app = express();              //create a new instance
const bodyParser = require('body-parser');
const {Prohairesis} = require('prohairesis');

const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

//const initializePassport = require('./passport-config')


const initializePassport = require('./passport-config')
initializePassport(
  passport,
  async email => await database.query(`SELECT * FROM users WHERE email = @email`, {email}),
  async id =>  await database.query(`SELECT * FROM users WHERE userId = @userId`, {id})
  )

/*initializePassport(
    passport, 
    email => database.query(`SELECT userId FROM users WHERE email = @email`, {email}),
    id =>  database.query(`SELECT userId FROM users WHERE userId = @userId`, {userId}),
    password =>  database.query(`SELECT password FROM users WHERE userId = @userId`, {userId})
    )*/

const mySQLString = 'mysql://be3800dd31540b:17967a93@us-cdbr-east-03.cleardb.com/heroku_cc4f88e5de0ff25?reconnect=true';
const database = new Prohairesis(mySQLString);



app
    .use(express.static("public"))
    .use(bodyParser.urlencoded({extended: false}))
    .use(bodyParser.json())

    .use(flash())
    .use(session({
        secret: process.env['SESSION_SECRET'],
        resave: false,
        saveUninitialized: false
    }))
    .use(passport.initialize())
    .use(passport.session())

    .get("/", function(req, res){
        res.sendFile(__dirname + "/");
        //res.render("index");
    })

    .get("/home", function(req, res){
        res.render("Logged In");
    })

    //registering new user
    .post("/register", async(req,res) => {
        const {firstName, lastName, email, password} = req.body;

        try {
            //const hashedPassword = await bcrypt.hash(password, 10)
            const user = await database.query(`
                INSERT INTO users(
                    firstName,
                    lastName,
                    email,
                    password
                ) VALUES (
                    @firstName,
                    @lastName,
                    @email,
                    @password
                )                    
                `,{
                    firstName,
                    lastName,
                    email,
                    password
                });

                res.status(200);
                res.redirect('/Pages/Signin.html');
            } catch (e) {
                console.error('Error adding user');
                res.status(500);
                res.end('Error adding user. Does this user exist already?');
            }
        })

    //Sign in
    .get("/signin", async(req, res) =>{
        res.redirect('/Pages/Signin.html');
    })

    .post("/signin", passport.authenticate('local',{
        sucessRedirect: '/home',
        failureRedirect: '/signin',
        failureFlash: true
        }))
    
    //Find a user
    /*.get("/api/login", async(req,res) => {
        //we may add anything here
        //res.sendFile(__dirname + "/index.html");
        try {
            below will get an array of users
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
        }))  */ 

app.listen(process.env.PORT || 8080, function(){
    console.log("Server is Running 8080");
});