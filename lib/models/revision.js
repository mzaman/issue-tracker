'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('./connection');
const Issue = require('./issue');
const User = require('./user');

const Revision = sequelize.define('Revision', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    issueId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'issue_id'
    },
    revisionNumber: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'revision_number'
    },
    issue: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'issue'
    },
    changes: {
        type: DataTypes.JSON,
        allowNull: true
    },
    updatedBy: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'updated_by'
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at'
    }
}, {
    tableName: 'revisions',
    timestamps: false // managed manually for updatedAt
});

// Associations
Revision.belongsTo(Issue, { foreignKey: 'issueId' });
Revision.belongsTo(User, { foreignKey: 'updatedBy', as: 'updatedByUser' });

Issue.hasMany(Revision, { foreignKey: 'issueId', as: 'revisions' });
User.hasMany(Revision, { foreignKey: 'updatedBy', as: 'revisionsMade' });

module.exports = Revision;