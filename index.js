const express = require('express');
const app =express();
const jwt = require('jsonwebtoken')
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


    //jwt related Api
    app.post('/jwt',async(req,res)=>{
      const user =req.body;
      const token =jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:'1hr'})
        res.send({token})

    })

    //middlewires
    
    const verifyToken =(req,res,next)=>{
      console.log('inside the verify token',req.headers.authorization)
      if(!req.headers.authorization){
        return res.status(401).send({message:'forbidden access'})
      }
      const token =req.headers.authorization.split(' ')[1]
      
      jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
        if(err){
          return res.status(401).send({message:'forbidden access'})
        }
        req.decoded =decoded;
        next()

      })

    }


    const verifyAdmin =async(req,res,next) =>{
      const email =req.decoded.email;
      const query ={email:email};
      const employees = await employeecollection.findOne(query)
      const isAdmin =employees?.role ==='admin';
      if(isAdmin){
        return res.status(403).send({message:'forbidden access'})
      }
      next();

    }

    //all employees

    app.get('/employees', verifyToken,verifyAdmin, async(req,res)=>{
      
      const result =await employeecollection.find().toArray()
      res.send(result)
    })


    app.get('/employees/admin/:email',verifyToken ,async(req,res)=>{
      const email =req.params.email;
      if(!email ==req.decoded.email){
        return res.status(403).send({message:'unauthorized access'})

      }
      const query ={email:email}
      const employees =await employeecollection.findOne(query)
       let admin =false;
       if(employees){
        admin =employees?.role === 'admin'

       }

       res.send({admin})

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

    app.delete('/employees/:id',verifyToken, verifyAdmin,async(req,res)=>{
      const id =req.params.id;
      const query ={_id:new ObjectId(id)}
      const result =await employeecollection.deleteOne(query)
      res.send(result)

    })


    
    //make admin

    app.patch('/employees/admin/:id', verifyToken,verifyAdmin,async(req,res)=>{
      const id =req.params.id;
      const filter ={_id:new ObjectId(id)}
      const updatedDoc ={
        $set:{
          role:'admin'
        }
      }

  const result =await employeecollection.updateOne(filter,updatedDoc)
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

