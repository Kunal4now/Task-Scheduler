const express = require('express');
const app = express();
const amqp = require('amqplib')
const schedule = require('./helper')
const Queue = require('./Queue');
const db = require('./db')
const Task = db.tasks

let pq = new Queue((a, b) => a[0] - b[0]);
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
            
            let detailedDependencies = dependencies.map(dep => dep.dataValues)
            dependencies = dependencies.map(dep => dep.dataValues.id)
            
            let newTask = new Task({
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

            newTask.dependencies = detailedDependencies

            console.log(newTask)
            pq.add(newTask)

        
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
    
            let detailedDependencies = dependencies.map(dep => dep.dataValues)
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

            newTask.dependencies = detailedDependencies
    
            pq.add(newTask);
    
            console.log('Received task at emailQueue: ', taskObj);
            channel.ack(task);
        });
    } catch(err) {
        console.log(err)
    }
}

app.get('/schedule', (req, res) => {
    let copy = new Queue();

    copy.heap = JSON.parse(JSON.stringify(pq.heap))
    copy.compare = pq.compare
    copy.graph = JSON.parse(JSON.stringify(graph))
    copy.backEdges = JSON.parse(JSON.stringify(pq.backEdges))
    copy. priorities = new Map()

    let orderding = []

    while (!copy.isEmpty()) {
        [priority, id] = copy.poll();
        orderding.push(`Job ${id}`)
    }

    return res.status(200).send(orderding)
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