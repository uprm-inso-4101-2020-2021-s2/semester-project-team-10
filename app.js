
//Page Description: This is the file for the rest API

const express = require("express"); //import express and
const app = express();              //create a new instance
const bodyParser = require('body-parser');
const {Prohairesis} = require('prohairesis');


const mySQLString = 'mysql://be3800dd31540b:17967a93@us-cdbr-east-03.cleardb.com/heroku_cc4f88e5de0ff25?reconnect=true';
const database = new Prohairesis(mySQLString);



app
    .use(express.static("public"))
    .use(bodyParser.urlencoded({extended: false}))
    .use(bodyParser.json())

    .get("/", function(req, res){
        res.sendFile(__dirname + "/index.html");
        //res.render("index");
    })

    //registering new user
    .post("/api/registered", async(req,res) => {
        const {email, password, stdNum} = req.body;

        try {
            const user = await database.query(`
                INSERT INTO users(
                    name,
                    email,
                    password
                ) VALUES (
                    @stdNum,
                    @email,
                    @password
                )                    
                `,{
                    stdNum,
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
    .put("/api/login", async(req,res) => {
        const {uname, uemail, upassword} = req.body;

        try {
            const user = await database.query(`
                SELECT * FROM users
                    WHERE name = @name
                    AND password = SHA2(@password,256)`,
                {
                    uname,
                    uemail,
                    upassword,
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
    .get("/api/login", async(req,res) => {
        //we may add anything here
        res.sendFile(__dirname + "/index.html");
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

app.listen(process.env.PORT || 8080, function(){
    console.log("Server is Running 8080");
});