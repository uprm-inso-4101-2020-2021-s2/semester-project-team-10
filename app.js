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

    .get("/profile", checkAuthenticated,  async (req, res)=>{
        const userid = req.user.userId
        const isStudent = (await database.query(`SELECT studentId FROM students WHERE userId = @userid`, {userid}))[0] != null
        console.log(isStudent)
        const isTutor = (await database.query(`SELECT tutorId FROM tutors WHERE userId = @userid`, {userid}))[0] != null
        console.log(isTutor)
        res.render('Profile.ejs',
        {data: {
        firstName: req.user.firstName, 
        lastName: req.user.lastName, 
        email: req.user.email,
        isStudent: isStudent,
        isTutor: isTutor}});
    })

    .get("/become_student", checkAuthenticated, async(req, res) =>{
        const userid = req.user.userId
        await database.query(`INSERT INTO students (studentId, userId)
        VALUES (@userid, @userid)`,
        {userid, userid})
        res.redirect('/profile')
    })

    .get("/become_tutor", checkAuthenticated, async(req, res) =>{
        const userid = req.user.userId
        await database.query(`INSERT INTO tutors (tutorId, userId)
        VALUES (@userid, @userid)`,
        {userid, userid})
        res.redirect('/profile')
    })

    //registering new user
    .get("/register", checkNotAuthenticated, (req, res) =>{
        //res.redirect('/Pages/Signin.html');
        res.render('Register.ejs')
    })

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

    .get("/create_session/:tutorid", async(req, res) =>{
        const id = req.params.tutorid
        const rating = (await database.query(`select avg(rating) as average from ranks where tutorID = @id;`, {id}))[0].average
        console.log(rating)
        res.render('Create_Session.ejs', {data: {tutorid: id, rating: rating}});
    })

    .post("/create_session/:tutorid", checkAuthenticated, async(req, res) =>{
        const {date, duration, subject, description} = req.body;        
        const tutorid = req.params.tutorid
        const userid = req.user.userId
        console.log(userid);
        await database.query(`INSERT INTO sessions (studentId, tutorId, date, duration, subject, description)
        VALUES ((SELECT studentId FROM students WHERE userId=@userid), @tutorid, @date, @duration, @subject, @description)`,
        {userid, tutorid, date, duration, subject, description})


        //insert into sessions (studentId, tutorId, date, duration, subject, description) VALUES ((select studentId from students where userId=34), 400, 20200923000000, 60, 'cool', 'desc')

        res.redirect('/sessions')
    })

    .get("/sessions", checkAuthenticated, async(req, res) => {
        const userid = req.user.userId
        const sessions = await database.query(`SELECT * FROM sessions natural join tutors natural join users WHERE studentId = @userid OR tutorId = @userid;`, {userid})    
        res.render('Sessions.ejs', {data: {sessions: sessions}} );
    })

    .get("/rank/:tutorid", checkAuthenticated, async(req, res)=>{
        const tutorid = req.params.tutorid
        res.render('Rank.ejs', {data: {tutorid: tutorid}})
    })

    .post("/rank/:tutorid", checkAuthenticated, async(req, res)=>{
        const tutorid = req.params.tutorid
        const userid = req.user.userId
        const rating = req.body.rating
        const comment = req.body.comment
        await database.query(`insert into ranks(studentID, tutorID, rating, comment) VALUES (@userid, @tutorid, @rating, @comment)`, {userid, tutorid, rating, comment})
        res.redirect("/sessions")
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

    .post("/course/take/:courseid", checkAuthenticated, async (req, res) =>{
        const courseid = req.params.courseid
        const userid = req.user.userId
        console.log(courseid)
        await database.query(`INSERT INTO takes (courseId, studentId) VALUES (@courseid, @userid)`, {courseid, userid})
        res.redirect('/mystudies');
    })

    .post("/course/teach/:courseid", checkAuthenticated, async (req, res) =>{
        const courseid = req.params.courseid
        const userid = req.user.userId
        await database.query(`INSERT INTO teaches (courseId, tutorId) VALUES (@courseid, @userid)`, {courseid, userid})
        res.redirect('/myteachings');
    })

    .get("/mystudies", checkAuthenticated, async (req, res) =>{
        //res.redirect('/Pages/Signin.html');
        const id  = req.user.userId
        const courses = await database.query(`SELECT *  FROM courses, takes 
                                                WHERE takes.courseId = courses.courseId 
                                                AND takes.studentId=@id`,{id})
        res.render('Subjects.ejs', {data: {courses: courses}})
    })

    .get("/myteachings", checkAuthenticated, async (req, res) =>{
        //res.redirect('/Pages/Signin.html');
        const id  = req.user.userId
        const courses = await database.query(`select *  from courses, teaches 
                                                where teaches.courseId = courses.courseId 
                                                and teaches.tutorId=@id`,{id})
        res.render('Subjects.ejs', {data: {courses: courses}})
    })

    .get("/tutors/:courseid", checkAuthenticated, async (req, res) =>{
        //res.redirect('/Pages/Signin.html');
        //const cname = req.data.courses.courseCode
        //const cnum = req.data.courses.courseNumber
        const id = req.params.courseid
        const tutors = await database.query(`SELECT * FROM tutors NATURAL JOIN users as T, teaches WHERE tutors.tutorId = teaches.tutorId AND teaches.courseId = @id;`, {id})
        res.render('Tutors.ejs', {data: {tutors: tutors, courseid : id}})
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