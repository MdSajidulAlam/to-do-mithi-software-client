const express = require('express');
const cors = require('cors');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qlspq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const taskCollection = client.db('task-db').collection('tasks')

        app.post('/addtask', async (req, res) => {
            const task = req.body
            const result = await taskCollection.insertOne(task)
            res.send({ success: true })
        })

        app.get('/mytasks', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const cursor = taskCollection.find(query)
            const myTask = await cursor.toArray()
            res.send(myTask)
        })

        app.delete('/task/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await taskCollection.deleteOne(query)
            res.send(result)
        })

        app.put('/task/:id', async (req, res) => {
            const id = req.params.id
            const updatedTask = req.body
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    taskName: updatedTask.taskName,
                    taskDate: updatedTask.taskDate,
                    taskDescription: updatedTask.taskDescription,
                },
            };
            const result = await taskCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

    }
    finally {

    }
}

run().catch(console.dir)

app.get('/', (req, res) => {
    res.send("To do app running")
})

app.listen(port, () => {
    console.log("App running on ", port);
})