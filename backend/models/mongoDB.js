const mongoose = require("mongoose");
require("dotenv").config

// Connect with mongoDB.
const urlDB = process.env.DB_URL;

mongoose.connect(urlDB,{
    useNewUrlParser : true,
    useUnifiedTopology: true,
    useFindAndModify : false 
});
const con_obj = mongoose.connection

con_obj.on("open",()=>{
   
    console.log("Connected to mongodb")
})
.on('error',(err)=>{
    console.log("DB error : ",err)
})

require("./meme.model")
