'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('./connection');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(150),
        unique: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash'
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = User;