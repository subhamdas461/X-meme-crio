// Import required modules
const express = require('express'),
      path = require('path'),
      morgan = require("morgan"),
      swaggerJsdoc = require("swagger-jsdoc"),
      swaggerUi = require("swagger-ui-express");

require("dotenv").config();
require("./models/mongoDB");
require("./models/meme.model");
const memesRoute = require("./routes/Memes");
const app = express();
const appSwagger = express();
// Middlewares :
app.use(morgan("dev"));
app.use(express.json())
app.use(express.static(path.join(__dirname , "../")))
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers","*")
    next();
});
// ------------------------------

// Send html to user on 
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname , "../") + "/frontend/html/")
})

/**
 * @swagger
 *  /memes:
 *     get:
 *        description : Get latest 100 memes
 *        responses:
 *            200:
 *              description: OK.
 *              
 * 
 */
/**
 * @swagger
 *  /memes/{id}:
 *     get:
 *        parameters:
 *            - in: path
 *              name: id
 *              required : true
 *              description: Meme id
 *        responses:
 *            200:
 *              description: OK
 *            404:
 *              description: Not Found
 *           
 */
/**
 * @swagger
 *  /memes:
 *     post:
 *        description : Submit memes.
 *        parameters : 
 *          - name : Body
 *            description : Json data - name,caption and url.
 *            required : true
 *            type : string 
 *            in : body
 *            default : {}
 *        responses:
 *            201:
 *              description: Created.
 *            400:
 *              description : Bad Request  
 *            409:
 *              description : Duplicate Entry 
 */

 /**
 * @swagger
 *  /memes/{id}:
 *     patch:
 *        description : Update caption or url of a particular meme
 *        parameters:
 *            - in: path
 *              name: id
 *              required : true
 *              description: Meme id
 *            - in: body
 *              name : Body
 *              description : Json data for caption and url
 *              default : {}
 *        responses:
 *            203:
 *              description: Updated.
 *            404:
 *              description: Not Found
 *           
 */
app.use("/memes",memesRoute);

app.use((req,res,next)=>{
    const err = new Error(`Not found - ${req.method} ${req.headers.host}${req.path}`);
    err.status = 404;
    next(err);
})
app.use((err,req,res,next)=>{
    res.status(err.status || 500);
    res.json({
        error : {
            status : err.status || 500,
            message : err.message
        }
    })
})
const serverPort = process.env.PORT || 8081;

app.listen(serverPort, (err)=>{
    if(err){
        return console.log("port Error",err)
    }
    console.log(`Server running on port: ${serverPort}`)
})

const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "X-Meme Stream API",
        version: "1.0.0",
        description:
          "This is a Meme-Stream application made with Express and documented with Swagger",
        license: {
          name: "MIT",
          url: "https://spdx.org/licenses/MIT.html",
        },
        contact: {
          name: "Subham Das",
          url: "https://linkedin.com/in/subhamdas461"
        },
      },
      servers: [
        {
          url: "http://localhost:8081"
        }
      ]
    },
    apis: ["index.js"],
};
  
const specs = swaggerJsdoc(swaggerOptions);

appSwagger.use("/swagger-ui",swaggerUi.serve,swaggerUi.setup(specs));

appSwagger.listen(8080,(err)=>{
    if(err){
       return console.log("Swager port errr");
    }
    console.log("Swager port running on port : ",8080)
})