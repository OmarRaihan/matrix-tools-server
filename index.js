const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// MiddleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sj2z4.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// VerifyJWT || Token
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

// Main Function
async function run() {
  try {
    await client.connect();
    const productCollection = client.db("matrix_tools").collection("products");
    const orderCollection = client.db("matrix_tools").collection("order");
    const reviewCollection = client.db("matrix_tools").collection("review");
    const newProductCollection = client.db("matrix_tools").collection("newProduct");
    const profileCollection = client.db("matrix_tools").collection("profile");
    const userCollection = client.db("matrix_tools").collection("users");

    // GET All Products
    app.get("/product", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    // DELETE || Product || from Manage Products
    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id.trim();
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    // GET API || Order by ID
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id.trim();
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });

    // POST API || Order
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    // GET API || MyOrders by Email
    app.get("/order/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const orders = await orderCollection.find(query).toArray();
      res.send(orders);
    });

    // GET All Orders || Manage Orders
    app.get("/order", async (req, res) => {
      const query = {};
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
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

    // GET || New Product
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

    // DELETE || New Product || from Manage Products
    app.delete("/newProduct/:id", async (req, res) => {
      const id = req.params.id.trim();
      const query = { _id: ObjectId(id) };
      const result = await newProductCollection.deleteOne(query);
      res.send(result);
    });

    // POST || MyProfile
    app.post("/profile", async (req, res) => {
      const profile = req.body;
      const result = await profileCollection.insertOne(profile);
      res.send(result);
    });

    // GET || MyProfile
    app.get("/profile", async (req, res) => {
      const query = {};
      const cursor = profileCollection.find(query);
      const profile = await cursor.toArray();
      res.send(profile);
    });

    // PUT || Users API ||
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
      res.send({ result, token });
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
