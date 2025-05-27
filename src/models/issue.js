
'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('./connection');
const User = require('./user');

const Issue = sequelize.define('Issue', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
    allowNull: false,
    defaultValue: 'open'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical', 'urgent'),
    allowNull: false,
    defaultValue: 'medium'
  },
  assignee: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'created_by'
  },
  updatedBy: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    field: 'updated_by',
    defaultValue: null
  }
}, {
  tableName: 'issues',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Issue.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Issue.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });
Issue.belongsTo(User, { foreignKey: 'assignee', as: 'assignedUser' });

User.hasMany(Issue, { foreignKey: 'createdBy', as: 'createdIssues' });
User.hasMany(Issue, { foreignKey: 'updatedBy', as: 'updatedIssues' });
User.hasMany(Issue, { foreignKey: 'assignee', as: 'assignedIssues' });

module.exports = Issue;