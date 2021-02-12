const express = require("express");

const app = express();

app.use(express.static("public"));
//This is where the GET and POST will be located

app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html");
});

app.listen(process.env.PORT || 8080, function(){
    console.log("Server is Running 8080");
});