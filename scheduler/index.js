const express = require('express');
const app = express();
const amqp = require('amqplib')
const schedule = require('./helper')
const PriorityQueue = require('./PriorityQueue');

let pq = new PriorityQueue((a, b) => a[0] - b[0]);
let graph = {}

consumeTasks();

async function consumeTasks() {
    const connection = await amqp.connect('amqp://localhost:5672');
    const channel = await connection.createChannel();

    const result = await  channel.assertQueue('jobs');

    channel.consume('jobs', (task) => {
        const taskObj = JSON.parse(task.content.toString());
        const {id, dependency, priority} = taskObj;
        graph[id] = {id, dependencies: dependency, priority};
        pq.add([parseInt(priority), id]);
        // graph.push({id, dependencies: dependency, priority});
        // edges.push({from: id, to: dependency[0]});
        console.log('Received task: ', taskObj);
        channel.ack(task);
    });
}

app.get('/schedule', (req, res) => {
    let visited = new Set();
    let copy = new PriorityQueue();
    copy.heap = JSON.parse(JSON.stringify(pq.heap));
    copy.compare = pq.compare
    // copy.compare = JSON.parse(JSON.stringify(pq.compare))
    const ordering = schedule(graph, visited, copy)
    res.send(ordering);
})

app.post('/excecute', (req, res) => {
    // empty the graph and the queue
    while (!pq.isEmpty()) {
        pq.poll();
    }
    graph = {};
    res.send('Graph and queue cleared');
})

app.listen(3000, () => {
    console.log('Scheduler listening on port 3000!');
    }
);