//Page Description: This is the file for the rest API

const express = require("express"); //import express and
const app = express();              //create a new instance
const bodyParser = require('body-parser');
const {Prohairesis} = require('prohairesis');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
//This is where the GET and POST will be located
const mySQLString = 'mysql://be3800dd31540b:17967a93@us-cdbr-east-03.cleardb.com/heroku_cc4f88e5de0ff25?reconnect=true';
const database = new Prohairesis(mySQLString);



app.post("/api/registered", async (req, res) => {
    database.execute(
        `INSERT INTO users (name, email, password) VALUES(@uname, @uemail, @upassword)`
    , {
        uname: req.body.email,
        uemail: req.body.password,
        upassword: req.body.stdNum
    })
    //res.json(req.body);
    res.end("Added User");
})
app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html");
});

app.listen(process.env.PORT || 8080, function(){
    console.log("Server is Running 8080");
});