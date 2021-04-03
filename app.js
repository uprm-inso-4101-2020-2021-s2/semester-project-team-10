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


const initializePassport = require('./passport-config')
initializePassport(
  passport,
  async email => await database.query(`SELECT * FROM users WHERE email = @email`, {email}),
  async userId =>  await database.query(`SELECT * FROM users WHERE userId = @userId`, {userId})
  )


const mySQLString = 'mysql://be3800dd31540b:17967a93@us-cdbr-east-03.cleardb.com/heroku_cc4f88e5de0ff25?reconnect=true';
const database = new Prohairesis(mySQLString);



app
    //.set('view-engine', 'ejs')
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
    .use(methodOverride('_method'))

    .get("/", function(req, res){
        res.sendFile(__dirname + "/");
        //res.render("index");
    })

    .get("/home", checkAuthenticated, (req, res)=>{
        res.send(JSON.stringify(req.user))
    })

    //registering new user
    .post("/register", checkNotAuthenticated, async(req,res) => {
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
    .get("/signin", checkNotAuthenticated, (req, res) =>{
        res.redirect('/Pages/Signin.html');
    })

    .post("/signin",checkNotAuthenticated, passport.authenticate('local',{
        successRedirect: '/home',
        failureRedirect: '/signin',
        failureFlash: true
        }))
    
    .delete('/logout', (req, res) => {
        req.logOut()
        res.redirect('/signin')
    })

    function checkAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }

        res.redirect('/signin')
    }

    function checkNotAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return res.redirect('/')
        }
        next()
    }

app.listen(process.env.PORT || 8080, function(){
    console.log("Server is Running 8080");
});