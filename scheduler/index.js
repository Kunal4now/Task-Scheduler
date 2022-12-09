const express = require('express');
const app = express();
const amqp = require('amqplib')
const schedule = require('./helper')
const PriorityQueue = require('./PriorityQueue');
const db = require('./db')
const Task = db.tasks

let pq = new PriorityQueue((a, b) => a[0] - b[0]);
let graph = {}

consumeTasks();

async function consumeTasks() {
    try {
        const connection = await amqp.connect('amqps://lycvucix:UjmwYJx8sdPIQ-AO05nbQYq0R2nxCGDs@puffin.rmq2.cloudamqp.com/lycvucix');
        const channel = await connection.createChannel();
    
        await  channel.assertQueue('smsQueue');
        await channel.assertQueue('emailQueue');

        channel.bindQueue('smsQueue', 'amq.direct', 'sms');
        channel.bindQueue('emailQueue', 'amq.direct', 'email');
    
        channel.consume('smsQueue', async (task) => {
            const taskObj = JSON.parse(task.content.toString());
            const {id, dependency, priority} = taskObj;
       
            let dependencies = await Task.findAll({
                where: {
                    name: dependency,
                    status: 'pending'
                }
            })
    
            dependencies = dependencies.map(dep => dep.dataValues.id)
    
            const newTask = new Task({
                name: taskObj.id,
                priority: taskObj.priority,
            })
    
            await newTask.save()
    
            const handleDependencies = async (dependencies) => {
                dependencies.forEach(async (dep) => {
                    await newTask.addDependency(dep)
                })
            }
    
            await handleDependencies(dependencies)
    
            graph[id] = {id, dependencies: dependency, priority};
            pq.add([parseInt(priority), id]);
    
            console.log('Received task at smsQueue: ', taskObj);
            channel.ack(task);
        });

        channel.consume('emailQueue', async (task) => {
            const taskObj = JSON.parse(task.content.toString());
            const {id, dependency, priority} = taskObj;
       
            let dependencies = await Task.findAll({
                where: {
                    name: dependency,
                    status: 'pending'
                }
            })
    
            dependencies = dependencies.map(dep => dep.dataValues.id)
    
            const newTask = new Task({
                name: taskObj.id,
                priority: taskObj.priority,
            })
    
            await newTask.save()
    
            const handleDependencies = async (dependencies) => {
                dependencies.forEach(async (dep) => {
                    await newTask.addDependency(dep)
                })
            }
    
            await handleDependencies(dependencies)
    
            graph[id] = {id, dependencies: dependency, priority};
            pq.add([parseInt(priority), id]);
    
            console.log('Received task at emailQueue: ', taskObj);
            channel.ack(task);
        });
    } catch(err) {
        console.log(err)
    }
}

app.get('/schedule', (req, res) => {
    let visited = new Set();
    let copy = new PriorityQueue();
    copy.heap = JSON.parse(JSON.stringify(pq.heap));
    copy.compare = pq.compare

    const ordering = schedule(graph, visited, copy)
    return res.status(200).json(ordering)
})

app.post('/excecute', async (req, res) => {
    try {
        let promises = []
        while (!pq.isEmpty()) {
            [priority, id] = pq.poll();
            const finished = Task.update({status: 'completed'}, {
                where: {
                    name: id
                }
            })
            promises.push(finished)
        }
    
        await Promise.all(promises)
    
        graph = {};
        res.status(200).send('All scheduled tasks excecuted!');   
    } catch(err) {
        console.log(err)
        return res.status(500).send('Internal Server Error!')
    }
})

app.listen(3000, () => {
    console.log('Scheduler listening on port 3000!');
});