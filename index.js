const express = require('express');
const app =express();
const cors = require('cors')
require('dotenv').config()
const port =process.env.PORT || 8000


//middilware 

app.use(cors())
app.use(express.json())


app.get('/',(req,res)=>{
    res.send('okkkkkkk')
})

app.listen(port,()=>{
    console.log(`Hr-sync ok ${port}`)
})

