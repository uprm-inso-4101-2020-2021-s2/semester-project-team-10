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
    .set('view-engine', 'ejs')
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
        //res.sendFile(__dirname + "/");
        res.render('index.ejs');
    })

    .get("/profile", checkAuthenticated, (req, res)=>{
        //res.send(req.user);
        res.render('Profile.ejs',
        {data: {
        firstName: req.user.firstName, 
        lastName: req.user.lastName, 
        email: req.user.email}});
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

    .get("/register", checkNotAuthenticated, (req, res) =>{
        //res.redirect('/Pages/Signin.html');
        res.render('Register.ejs')
    })

    .get("/subjects", checkAuthenticated, async (req, res) =>{
        //res.redirect('/Pages/Signin.html');
        const courses = await database.query(`SELECT * FROM courses`)
        res.render('Subjects.ejs', {data: {courses: courses}})
    })

    .get("/course/select", checkAuthenticated, async (req, res) =>{
        //res.redirect('/Pages/Signin.html');
        const courses = await database.query(`SELECT * FROM courses`)
        res.render('Subjects.ejs', {data: {courses: courses}})
    })
    .post("/course/take", checkAuthenticated, async (req, res) =>{
        await database.query(`SELECT * FROM courses`)
        res.redirect('/mystudies');
        res.render('Subjects.ejs', {data: {courses: courses}})
    })

    .post("/course/teach", checkAuthenticated, async (req, res) =>{
        await database.query(`SELECT * FROM courses`)
        res.redirect('/myteachings');
        res.render('Subjects.ejs', {data: {courses: courses}})
    })

    .get("/mystudies", checkAuthenticated, async (req, res) =>{
        //res.redirect('/Pages/Signin.html');
        const id  = req.user.userID
        const courses = await database.query(`select courseCode, courseNumber 
                                                from users, courses, takes, students
                                                where users.userId = students.userID 
                                                        and students.studentID = takes.studentId
                                                        and takes.courseId = courses.courseId 
                                                        and students.userID=@userID;`,{id})
        res.render('Subjects.ejs', {data: {courses: courses}})
    })

    .get("/myteachings", checkAuthenticated, async (req, res) =>{
        //res.redirect('/Pages/Signin.html');
        const id  = req.user.userID
        const courses = await database.query(`select courseCode, courseNumber 
                                                from users, courses, teaches, tutors
                                                where users.userId = tutors.userID 
                                                        and tutors.studentID = teaches.studentId
                                                        and teaches.courseId = courses.courseId 
                                                        and tutors.userID=@userID;`,{id})
        res.render('Subjects.ejs', {data: {courses: courses}})
    })

    .get("/tutors/<:courseid>", checkAuthenticated, async (req, res) =>{
        //res.redirect('/Pages/Signin.html');
        //const cname = req.data.courses.courseCode
        //const cnum = req.data.courses.courseNumber
        const tutors = await database.query(`SELECT * FROM tutors NATURAL JOIN users`)
        res.render('Tutors.ejs', {data: {tutors: tutors}})
    })

    //Sign in
    .get("/signin", checkNotAuthenticated, (req, res) =>{
        //res.redirect('/Pages/Signin.html');
        res.render('Signin.ejs')
    })

    .post("/signin",checkNotAuthenticated, passport.authenticate('local',{
        successRedirect: '/profile',
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