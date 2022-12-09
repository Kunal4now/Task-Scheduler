const {Sequelize, DataTypes} = require('sequelize');

const sequelize = new Sequelize('test', '3uce753iL6N4q6T.root', 'nMj1tL4i39FTguw9', {
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com', 
    dialect: 'mysql',
    port: 4000,
    ssl: true,
    dialectOptions: {
        ssl: {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: true
          }
    }
})

sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

let db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

db.tasks = require('./models/Task')(db.sequelize, DataTypes)

db.tasks.belongsToMany(db.tasks, {as: 'dependencies', through: 'task_dependencies'});

db.sequelize.sync().then(() => {
    console.log('re-sync successful!');
})

module.exports = db