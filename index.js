const express = require("express");
const cors = require("cors");
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

    app.get("/services", async (req, res) => {
      const size = Number(req.query.size);
      const query = {};
      const cursor = servicesCollection.find(query).limit(size);
      const services = await cursor.toArray();
      res.send(services);

      app.get("/packagePriceTable", async (req, res) => {
        const query = {};
        const cursor = packagePriceCollection.find(query);
        const packagePrices = await cursor.toArray();
        res.send(packagePrices);
      });

      app.get("/services/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const service = await servicesCollection.findOne(query);
        res.send(service);
      });
      app.get("/reviews", async (req, res) => {
        // console.log(req.query.itemId);
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
        console.log(userReview);
        const result = await reviewCollection.insertOne(userReview);
        res.send(result);
      });

      app.get("/my_reviews", async (req, res) => {
        // console.log(req.query.userEmail);
        let query = {};

        if (req.query.userEmail) {
          query = {
            userEmail: req.query.userEmail,
          };
        }

        const cursor = reviewCollection.find(query);
        const myReviews = await cursor.toArray();
        res.send(myReviews);
      });

      app.delete("/my_reviews/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await reviewCollection.deleteOne(query);
        res.send(result);
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
