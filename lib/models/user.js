'use strict';

const Sequelize = require('sequelize');
const sequelize = require('./connection');

const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: Sequelize.STRING(150),
        unique: true,
        allowNull: false
    },
    password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    tableName: 'users'
});

module.exports = User;