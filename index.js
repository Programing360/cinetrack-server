const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 5000;
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;

app.get("/", (req, res) => {
  res.send("CineTrack server is running");
});

app.listen(PORT, () => {
  console.log(`CineTrack server is running on port ${PORT}`);
});


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const db = client.db("cineTrack");
    const movieCollection = db.collection("movieCollection");


    app.get('/movies', async (req, res) => {

        try {
            const movies = await movieCollection.find().toArray();
            res.send(movies);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    })

    // post route to add a new movie
    app.post('/movies', async (req, res) => {
        const newMovie = req.body;
        const result = await movieCollection.insertOne(newMovie);
        res.send(result);
    });


    // Patch route to update a movie by ID
    app.patch('/movies/:id', async (req, res) => {
        const { id } = req.params;
        const updatedMovie = req.body;

        const filter = {_id: new ObjectId(id)};

        const updateDoc = {
            $set: updatedMovie,
        };

        const result = await movieCollection.updateOne(filter, updateDoc);
        if (result.matchedCount === 0) {
            return res.status(404).send({ error: "Movie not found" });
        }
        res.send({ message: "Movie updated successfully" });


    })

    app.delete('/movies/:id', async (req, res) => {
        const { id } = req.params;
        
        const filter = {_id: new ObjectId(id)};

        const result = await movieCollection.deleteOne(filter);
        if (result.deletedCount === 0) {
            return res.status(404).send({ error: "Movie not found" });
        }
        res.send({ message: "Movie deleted successfully" });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
