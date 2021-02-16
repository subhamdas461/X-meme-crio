//This is Javascript for frontend.

//variables declaration here ---
const submitBtn = document.querySelector("form button"),
      form = document.querySelector(".input_form"),
      inputs = document.querySelectorAll("form input"),
      postDropdown = document.querySelectorAll(".top-post-dd"),
      username_time = document.querySelector(".name_time"),
      memeSection = document.querySelector("section"),
      editForm = document.querySelector(".edit-form"),
      editInputs = document.querySelectorAll(".edit-form input"),
      editSaveBtn = document.querySelector(".edit-save-btn"),
      exitEditBtn = document.querySelector(".edit-form .fa-times"),
      fload = document.querySelector("#firstL"),
      blackBackground = document.querySelector(".hidden-edit-background");
// --------------------------------------------------------
// get Memes every time page reloads
getMeme("/memes");
// user defined functions for GET, POST and PATCH
async function postMeme(url,data){
    
    let options = {
        method : "POST",
        headers : {
            "Content-type" : "application/json"
        },
        body : JSON.stringify(data)
    }
    let rawRes = await fetch(url,options);
    let response = await rawRes.json();
    if(rawRes.status >= 200 && rawRes.status < 300){
        submitBtn.textContent = "Submit meme";
        submitBtn.disabled = false;
        submitBtn.style.cursor = "pointer"
        Swal.fire(
            'Submitted!',
            `Your Id : ${response.id}`,
            `success`
        ).then(()=>{
            location.reload()
        })
    }
    else{
        submitBtn.textContent = "Submit meme";
        submitBtn.disabled = false;
        submitBtn.style.cursor = "pointer"
        Swal.fire(
            'Error!',
            ` ${response.error}`,
            `warning`
        )
    }
}
async function updateMeme(url,data){
    let options = {
        method : "PATCH",
        headers : {
            "Content-type" : "application/json"
        },
        body : JSON.stringify(data)
    }
    let rawRes = await fetch(url,options);
   
    if(rawRes.status >= 200 && rawRes.status < 300){
        editSaveBtn.textContent = "Save changes";
        editSaveBtn.disabled = false;
        editSaveBtn.style.cursor = "pointer"
        Swal.fire(
            `Updated!`,
            ``,
            `success`
        ).then(()=>{
            location.reload()
        })
    }
    else{
        editSaveBtn.textContent = "Save changes";
        editSaveBtn.disabled = false;
        editSaveBtn.style.cursor = "pointer"
        Swal.fire(
            `Not updated!`,
            `Check caption or url!`,
            `warning`
        )
    }
}
async function getMeme(url){
    let rawRes = await fetch(url);
    let response = await rawRes.json();
    try {
        if(response){
            if(response.length === 0){
                fload.remove()
                throw Error("No memes available! Be the first one to post")
            }
            
            // Look for response data and append to <section>
            for(let i =0; i<response.length; i++){
                let time = new Date(response[i].timestamp).toLocaleString([], {hour: '2-digit', minute:'2-digit',hour12:true});   
                let isEdited = response[i].updatedAt ? "(edited)" : "";
                let memeBox = 
                `   <div class="name_time">
                        <div class="name-icon">
                            <i class="fas fa-user-circle"></i>
                            <h1 class="owner-name"></h1>
                            <code class="is-edited">&nbsp;${isEdited}</code>
                        </div>
                        <p class="timestamp">${time}</p>
                    </div>
                    <p class="owner-caption"></p>
                    <div data-id=${response[i].id} data-index=${i} class="edit-btn">Edit &nbsp;<i class="fas fa-edit"></i>
                    </div>
                    <img data-src="${response[i].url}" src="/frontend/assets/icons/load2.svg" class="meme-image" onerror="this.src='/frontend/assets/icons/imgnotfound.png'" alt="meme-image">
                `;
                let a = document.createElement("div")
                a.classList.add("meme-wrapper")
                a.innerHTML = memeBox
                memeSection.append(a)
            }

        // first loader remove after loading       
            fload.remove()
            let name = document.querySelectorAll(".owner-name");
            let caption = document.querySelectorAll(".owner-caption");
            name.forEach((e,i,a)=>{
                e.innerText = response[i].name;
                caption[i].textContent = response[i].caption;
            })

        // Loading image only if visible - using native Intersection Observer API
            let images = document.querySelectorAll(".meme-wrapper img")
            let options = {
                root : null,
                rootMargin : "0px",
                threshold : 0.25
            }
            let observer = new IntersectionObserver((entries,observer)=>{
                entries.forEach((item)=>{
                    // console.log(item)
                    item.target.src = "/frontend/assets/icons/load2.svg"
                    if(item.isIntersecting && item.target.className === "meme-image"){
                        let imgurl = item.target.getAttribute("data-src")
                        if(imgurl){
                            item.target.src = imgurl
                            observer.unobserve(item.target);
                        
                        }
                    }
                })
            },options);
            images.forEach(e=>{

                observer.observe(e)
            })
        }
        let editBtnLists = document.querySelectorAll(".edit-btn");
        let id_for_edit;
        for(let e of editBtnLists){
            e.addEventListener("click",evt=>{
                let index = Number(e.dataset.index);
                const {id,name,caption,url} = response[index];
                id_for_edit = id;
                editInputs[0].value =name;
                editInputs[1].value =caption;
                editInputs[2].value =url;
                editForm.classList.remove("global-hide");
                blackBackground.classList.remove("global-hide");
            })
        }
        editSaveBtn.addEventListener("click",async (evt)=>{
                checkInputForEmpty(editInputs)
                let error = emptyCheck(editInputs)
                if(!error){
                    editSaveBtn.textContent = "Loading...";
                    editSaveBtn.disabled = true;
                    editSaveBtn.style.cursor = "not-allowed"
                    

                    try {
                        let isUrl = await checkUrl(editInputs[2].value);
                        console.log("url :",isUrl)
                        const data = {
                            caption : editInputs[1].value,
                            url : editInputs[2].value
                        }
                        const patchUrl = `/memes/${id_for_edit}`
                        updateMeme(patchUrl,data); 
                        
                    } catch (error) {
                        editSaveBtn.textContent = "Save Changes"; 
                        editSaveBtn.disabled = false;
                        editSaveBtn.style.cursor = "pointer"
                        console.log("catch error:",error)
                        Swal.fire(
                            "Error",
                            error,
                            'warning'
                        )
                    }
                }
            })
        
    } 
    catch (err) {

        Swal.fire(
            "",
            err.message,
            'warning'
        )
    }
}

// Validation of inputs
var emptyCheck =(input)=>{
    let err = false ;
    input.forEach(e=>{
        if(e.classList.contains("error-active")){
            
            err = true
        }
    })
    return err
}
let checkInputForEmpty = (inpList) =>{
    inpList.forEach(e=>{
        e.addEventListener("blur",evt=>{
            if( /^\s*$/.test(e.value)){
                e.classList.add("error-active");
                e.nextElementSibling.classList.add("global-visible");
             }
             else{
                e.classList.remove("error-active");
                e.nextElementSibling.classList.remove("global-visible");
            }
        })
    })
} // ----------------------

checkInputForEmpty(inputs)
checkInputForEmpty(editInputs)

submitBtn.addEventListener("click",async evt=>{
    // Prevents the default submission behaviour
    evt.preventDefault()
    // console.log(inputs[2].value)
   

    checkInputForEmpty(inputs)
    inputs.forEach(e=>{
       
        if( /^\s*$/.test(e.value)){
            e.classList.add("error-active");
            e.nextElementSibling.classList.add("global-visible");
        }
        else{ 
            e.classList.remove("error-active");
            e.nextElementSibling.classList.remove("global-visible");
        }
        
    })
    let error = emptyCheck(inputs)
    if(!error){
        submitBtn.textContent = "Loading..."; 
        submitBtn.disabled = true;
        submitBtn.style.cursor = "not-allowed"
        try {
            let isUrl = await checkUrl(inputs[2].value);
            console.log("url :",isUrl)
            const memePost = {
                name : inputs[0].value,
                caption : inputs[1].value,
                url : inputs[2].value
            }
            const url = "/memes"
            postMeme(url,memePost)
            
        } catch (error) {
            submitBtn.textContent = "Submit meme"; 
            submitBtn.disabled = false;
            submitBtn.style.cursor = "pointer"
            console.log("catch error:",error)
            Swal.fire(
                "Error",
                error,
                'warning'
            )
        }
    }
})

function handleDropdown(elem){ 
    if(form.classList.contains("dropdown-form")){
        elem.lastElementChild.style.transform = "rotateZ(180deg)"
        inputs.forEach(e=>{
            e.classList.remove("global-hide")
        })
        submitBtn.classList.remove("global-hide")
    }
    else{
        elem.lastElementChild.style.transform = "rotateZ(0deg)"
        inputs.forEach(e=>{
            e.classList.add("global-hide")
        })
        submitBtn.classList.add("global-hide")
    }
    form.classList.toggle("dropdown-form")
}
// Edit form exit functions----
exitEditBtn.addEventListener("click",(evt)=>{
    editForm.classList.add("global-hide")
    blackBackground.classList.add("global-hide")
    
})
blackBackground.addEventListener("click",(evt)=>{
    editForm.classList.add("global-hide")
    blackBackground.classList.add("global-hide")
})

function checkUrl(url){
    console.log("Checking")
    return new Promise((resolve,reject)=>{
        
        let img = new Image();
        img.src = url
        img.onerror = img.onabort = function() {
            clearTimeout(timer);
            reject("Invalid image url");
        };
        img.onload = function() {
             clearTimeout(timer);
             resolve("success");
        };
        timer = setTimeout(function() {
            img.src = "//noimage";
            reject("Can't get an image");
        }, 4000); 
        
    })
}