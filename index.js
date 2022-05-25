const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// MiddleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sj2z4.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const productCollection = client.db("matrix_tools").collection("products");
    const reviewCollection = client.db("matrix_tools").collection("review");
    const newProductCollection = client.db("matrix_tools").collection("newProduct");

    // GET All Products
    app.get("/product", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    //   API || Order by ID
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id.trim();
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });

    // POST API || Add Review || Review Collection
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    // API for Review Collection
    app.get("/review", async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    // GET New Product
    app.get("/newProduct", async (req, res) => {
      const query = {};
      const cursor = newProductCollection.find(query);
      const newProducts = await cursor.toArray();
      res.send(newProducts);
    });

    // POST || Add New Product || newItem Collection
    app.post("/newProduct", async (req, res) => {
      const newProduct = req.body;
      const result = await newProductCollection.insertOne(newProduct);
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.dir);

// ROOT / Blank API
app.get("/", (req, res) => {
  res.send("Hello from MATRIX!");
});

// Root API Supporter
app.listen(port, () => {
  console.log(`MATRIX App listening on port ${port}`);
});
