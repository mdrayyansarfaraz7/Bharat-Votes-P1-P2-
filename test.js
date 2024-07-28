const express=require('express');
const app=express();
const nodemailer = require("nodemailer");


app.get('/',(req,res)=>{
    res.send("I am Server");
});

app.get('/mail',async(req,res)=>{

const transport = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'queenie22@ethereal.email',
        pass: 'B1TAzc79aBvJgEJmWy'
    }
});

const info = await transport.sendMail({
    from: '"Election Commission Of India " <hoodrasool100@gmail.com>', // sender address
    to: "mdrayyansarfaraz@gmail.com", // list of receivers
    subject: "Test", // Subject line
    text: "Test?", // plain text body
  });
    res.send("MAIL SENT");
});

app.listen(5000,(req,res)=>{
    console.log("Listining to port 5000");
})

