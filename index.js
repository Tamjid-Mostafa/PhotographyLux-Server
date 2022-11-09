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
