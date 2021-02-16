const mongoose = require("mongoose");

// Schema for mongoDB
let memeSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
    },
    caption : {
        type : String,
        required : true
    },
    url : {
        type : String,
        required : true
    },
    timestamp : {
        type : Number
    },
    updatedAt : {
        type : Number
    }
});



mongoose.model("Meme",memeSchema)