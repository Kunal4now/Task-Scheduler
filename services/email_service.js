const express = require('express');
const amqp = require('amqplib');

const app = express();

app.use(express.json());

app.post('/task/add', async (req, res) => {
    const task = req.body;
    const connection = await amqp.connect('amqp://localhost/5672');
    const channel = await connection.createChannel();
    await channel.assertQueue('jobs');
    channel.sendToQueue('jobs', Buffer.from(JSON.stringify(task)));
    res.send('Task added!');
})

app.listen(5001, () => {
    console.log('Email service listening on port 5001!');
}); 