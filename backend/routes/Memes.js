const e = require("express");
const express = require("express"),
      mongoose = require("mongoose");

const router = express.Router();
const Meme = mongoose.model("Meme")
const app = express()



// GET - /memes----
router.get("/",async (req,res)=>{
       await Meme.find()
       .sort({_id:-1})
       .limit(100)
       .then((docs)=>{
           if(!docs){
               return res.status(404).json({"error":"Error in retrieving data"})
           }
       
            let resposeArray = [];
            docs.map(e=>{
                let allMemeData = {
                    id : e._id,
                    name : e.name,
                    caption : e.caption,
                    url : e.url,
                    timestamp : e.timestamp,
                    updatedAt : e.updatedAt
                }
                resposeArray.push(allMemeData)
           })
           
           res.json(resposeArray)
       }) 
})

// POST - /memes
router.post("/", async (req,res)=>{
    try{
        const {name,caption,url} = await req.body ;
        if(!name || !caption || !url){
            res.status(400)
            throw Error("Name, caption,url all required!")
        }
        let nameNew = checkExtraWhiteSpce(name);
        let captionNew = checkExtraWhiteSpce(caption);
        let urlNew = checkExtraWhiteSpce(url);
        if(nameNew && nameNew.length<=50 && captionNew && captionNew.length<=200 && urlNew){
            await Meme.find((err,docs)=>{
                if(!err){
                    // check for duplicate entry.
                    let duplicate = docs.some(item => {
                        if (nameNew === item.name && captionNew === item.caption && urlNew === item.url) {
                            return true;
                        }
                    })

                    if(duplicate){
                        return res.status(409).json({"error": "Name, caption & url already exist"})
                    }
                    
                    insertData(req,res);   
                }
                else{
                    console.log(err)
                    throw Error(err)
                }
            })
        }
        else{
            throw Error("Database error!")
        }
    }
    catch(error){
        console.log("Catch error : ",error)
        res.json({"error": error.message})
    }
})

// GET - /memes/<id>
router.get("/:id", async (req,res)=>{
    if(!mongoose.Types.ObjectId.isValid(req.params.id)){
        console.log("Get by id error")
        return res.status(404).json({"error": `Meme not found by id : ${req.params.id}`})
    }
    await Meme.findById(req.params.id, (err, memeData)=>{
        if(!err && memeData){ 
           
            console.log("MemeData:",memeData);
            return res.status(200).json(memeData)
        }
        return res.status(404).json({"error": `Meme not found with id : ${req.params.id}`})
    })
})

// PATCH for edit - /memes/<id>
router.patch("/:id",async (req,res)=>{
    if(!mongoose.Types.ObjectId.isValid(req.params.id)){
        console.log("Get by id error")
        return res.status(404).json({"error": `Meme not found by id : ${req.params.id}`})
    }
    
    const _id = req.params.id;

    const {caption, url} = await req.body;
    let updateData = {updatedAt: Date.now()}

    if(caption){
        updateData.caption = checkExtraWhiteSpce(caption) 
    }
    if(url){
        updateData.url = checkExtraWhiteSpce(url)
    }
    
    if(!(updateData.caption || updateData.url)){
        console.log("request body incorrect")
        return res.status(400).json({"error":"Invalid request"})
    }
    else{
        // req.body.updatedAt = Date.now()
       
        const updatedMeme = await Meme.findByIdAndUpdate(_id, updateData,{
            new: true
        });
        if(updatedMeme){
            console.log(updatedMeme,"done")
            return res.status(204).json({"msg":"Updated successfully"})
        }
        else{
            console.log("err update")
            return res.status(404).json({"error": `Meme not found by id : ${_id}`})
        }
       
    }
   
})

// function : Insert data into DB
const insertData = async (req,res)=>{

    let meme = new Meme();
    const {name,caption,url} = await req.body ;
    try {
        meme.name = checkExtraWhiteSpce(name);
        meme.caption = checkExtraWhiteSpce(caption);
        meme.url = checkExtraWhiteSpce(url);
        meme.timestamp = Date.now();
        meme.updatedAt = null;
        meme.save(async (err, doc) => {
            if (!err) {
                await res.status(201).json({ id: meme._id });
                return console.log("Meme Posted : ", doc);
            }
            else{
                res.status(400)
                throw Error("Invalid field")
            }
        }) 
    } 
    catch(error) {
        console.log("Error on inserting : ", error.message);
        res.json({"error": error.message})
    }

}

// check for unwanted white spaces
function checkExtraWhiteSpce(sentence){
    return sentence.replace(/\s+/g, ' ').trim();
}


module.exports = router;