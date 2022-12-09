const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define('task', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        priority: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            Enumerator: ['pending', 'completed'],
            defaultValue: 'pending'
        },
    }, {
        timestamps: true
    })

    return Task
}