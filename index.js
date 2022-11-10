const express = require("express");
const cors = require("cors");
 const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.j8jry5z.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next){
  const authHeader = req.headers.authorization;
  console.log(authHeader);

  if(!authHeader){
      return res.status(401).send({message: 'unauthorized access'});
  }
  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
      if(err){
          return res.status(403).send({message: 'Forbidden access'});
      }
      req.decoded = decoded;
      next();
  })
}



const run = async () => {
  try {
    const servicesCollection = await client
      .db("photographylux")
      .collection("services");
    const packagePriceCollection = await client
      .db("photographylux")
      .collection("packagePriceTable");
    const reviewCollection = await client
      .db("photographylux")
      .collection("reviews");
    const foodPhotoCollection = await client
      .db("photographylux")
      .collection("foodPhotos");



    app.post('/jwt', (req,res) => {
      const user = req.body;
      // console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10h'})
      res.send({token}) 
    
    })



     /* Create Services  */
     app.get("/services", async (req, res) => {
      const size = Number(req.query.size);
      const query = {};
      const cursor = servicesCollection.find(query).limit(size);
      const services = await cursor.toArray();
      res.send(services);



      app.get("/services/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const service = await servicesCollection.findOne(query);
        res.send(service);
      });


     app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.send(result);
    });

  


     
      /* ----REviewes---------- */

      app.get("/reviews",  async (req, res) => {

        let query = {};

        if (req.query.service_name) {
          query = {
            service_name: req.query.service_name,
          };
        }

        const cursor = reviewCollection.find(query);
        const reviews = await cursor.toArray();
        res.send(reviews);
      });


      app.post("/reviews", async (req, res) => {
        const userReview = req.body;
        const result = await reviewCollection.insertOne(userReview);
        res.send(result);
      });



     



 app.get("/packagePriceTable", async (req, res) => {
        const query = {};
        const cursor = packagePriceCollection.find(query);
        const packagePrices = await cursor.toArray();
        res.send(packagePrices);
      });



      app.get("/my_reviews",verifyJWT, async (req, res) => {


        const decoded = req.decoded;
        if(decoded.email !== req.query.email){
          res.status(403).send({message: 'Unauthorized Access'});
        }

        let query = {};

        if (req.query.email) {
          query = {
            email: req.query.email,
          };
        }

        const cursor = reviewCollection.find(query);
        const myReviews = await cursor.toArray();
        res.send(myReviews);
      });

      app.patch("/my_reviews/:id", async (req, res) => {
        const id = req.params.id;
            const userReview = req.body
            const query = { _id: ObjectId(id) }
            const updateReview = {
                $set:{
                    service_name: userReview.service_name,
                    name: userReview.name,
                    text: userReview.text

                }
            }
            const result = await reviewCollection.updateOne(query, updateReview);
            res.send(result);
      });
      app.delete("/my_reviews/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await reviewCollection.deleteOne(query);
        res.send(result);
      });



      app.get("/foodPhotos", async (req, res) => {
        const query = {};
        const cursor = foodPhotoCollection.find(query);
        const foodPhoto = await cursor.toArray();
        res.send(foodPhoto);
      });


    });
  } finally {
  }
};
run().catch((error) => console.log(error));

app.get("/", (req, res) => {
  res.send("Server is Running");
});
app.listen(port, () => {
  console.log(`Project is running : ${port}`);
});
