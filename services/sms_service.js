const express = require('express');
const amqp = require('amqplib');
const app = express();

app.use(express.json());

app.post('/task/add', async (req, res) => {
    try {
        const task = req.body;
        const connection = await amqp.connect('amqp://localhost:5672');
        const channel = await connection.createChannel();
    
        const result = await  channel.assertQueue('jobs');
        
        channel.sendToQueue('jobs', Buffer.from(JSON.stringify(task)));
        res.send('Task added!');
    } catch(err) {
        console.log(err);
    }
})

app.listen(5000, () => {
    console.log('Sms service listening on port 5000!');
});