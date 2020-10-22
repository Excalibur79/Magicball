const express=require("express");
const app=express();
const cors=require("cors");
app.use(cors());
const socket=require("socket.io");
var {Aki}=require("aki-api");
var akiarray=[];


const PORT=process.env.PORT || 1000;

app.use("/",require("./Routes/api/routes"));


if(process.env.NODE_ENV==="production")
{
    app.use(express.static("client/build"));
    app.get("*",function(req,res)
    {
        res.sendFile(path.resolve(__dirname,"client","build","index.html"));
    });
}



var server = app.listen(PORT,()=>console.log(`Server has started on Port ${PORT}`));
var io=socket(server);
io.on("connection",(socket)=>
{
    console.log("Made a socket connection ");
    socket.on("join",async (data,cb)=>
    {
       
        const aki = new Aki('en');
        var akiclone=akiarray.find((ob)=>JSON.stringify(ob)===JSON.stringify(aki));
        var isakipresent=akiclone?true:false;
        if(!isakipresent)
        {
            akiarray.push({socketid:socket.id,aki:aki});

        }
        console.log("Aki arrays length is : ",akiarray.length);
        await aki.start();
        socket.join(aki.session);
        cb(aki);

    })
    socket.on("answered",async (data,cb)=>
    {
        var aki=akiarray.find((ob)=>ob.aki.session===data.session);
        await aki.aki.step(data.answer);
        if(aki.aki.progress >= 70 || aki.aki.currentStep >= 78)
        {
            await aki.aki.win();
            io.to(aki.aki.session).emit("Foundmatches",{matches:aki.aki.answers,guessCount:aki.aki.guessCount});
            cb();

        }
        else
        {
            io.to(aki.aki.session).emit("Question",aki.aki);
            cb();
        }
       
    })
    socket.on("disconnect",()=>
    {
        
        console.log(" Disconnected!",socket.id);
        akiarray=akiarray.filter(aki=>aki.socketid!==socket.id);
        console.log("Now The aki array is ",akiarray.length);
        

    })
})

