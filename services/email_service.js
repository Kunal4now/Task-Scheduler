const express = require('express');
const amqp = require('amqplib');

const app = express();

app.use(express.json());

app.post('/task/add', async (req, res) => {
    try {
        const task = req.body;
        const connection = await amqp.connect('amqps://lycvucix:UjmwYJx8sdPIQ-AO05nbQYq0R2nxCGDs@puffin.rmq2.cloudamqp.com/lycvucix');
        const channel = await connection.createChannel();
        await channel.assertQueue('emailQueue');

        await channel.assertQueue('emailQueue');
        await channel.bindQueue('emailQueue', 'amq.direct', 'email');

        channel.sendToQueue('emailQueue', Buffer.from(JSON.stringify(task)));
        res.status(200).send('Task added!');
    } catch(err) {
        console.log(err);
        return res.status(500).send('Internal server error');
    }
})

app.listen(5001, () => {
    console.log('Email service listening on port 5001!');
}); 