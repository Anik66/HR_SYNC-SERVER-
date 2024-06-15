const express = require('express');
const app =express();
const cors = require('cors')
require('dotenv').config()
const port =process.env.PORT || 8000


//middilware 

app.use(cors())
app.use(express.json())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0wrhevo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();

    const workcollection = client.db('HrServiceDb').collection('workcollection')
    const employeecollection = client.db('HrServiceDb').collection('employees')
    const reviewcollection = client.db('HrServiceDb').collection('reviews')
    const cartcollection = client.db('HrServiceDb').collection('carts')
    // Send a ping to confirm a successful connection
    //await client.db("admin").command({ ping: 1 });


    //all employees

    app.get('/employees',async(req,res)=>{
      const result =await employeecollection.find().toArray()
      res.send(result)
    })

    app.post('/employees',async(req,res)=>{
      const user =req.body;
      const query ={email:user.email}
      const exsitingUser =await employeecollection.findOne(query)
      if(exsitingUser){
        return res.send({message:'user already added',insertedId:null})
      }
      const result =await employeecollection.insertOne(user)
      res.send(result)
    })

    app.get('/work',async(req,res)=>{
        const result =await workcollection.find().toArray()
        res.send(result)
    })


    app.get('/reviews',async(req,res)=>{
        const result =await reviewcollection.find().toArray()
        res.send(result)
    })



    app.delete('/employees/:id',async(req,res)=>{
      const id =req.params.id;
      const query ={_id:new ObjectId(id)}
      const result =await employeecollection.deleteOne(query)
      res.send(result)

    })

    //cart collection

    app.get('/carts',async(req,res)=>{
      const email =req.query.email
      const query ={email:email}
      const result =await cartcollection.find(query).toArray()
      res.send(result)

    })

    app.delete('/carts/:id',async(req,res)=>{
      const id =req.params.id;
      const query = {_id:new ObjectId(id)}
      const result =await cartcollection.deleteOne(query)
      res.send(result)
    })

    app.post('/carts',async(req,res)=>{
      const cartItem =req.body
      const result =await cartcollection.insertOne(cartItem)
      res.send(result)
    })
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('okkkkkkk')
})

app.listen(port,()=>{
    console.log(`Hr-sync ok ${port}`)
})

