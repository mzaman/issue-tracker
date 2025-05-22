'use strict';

const Sequelize = require('sequelize');
const sequelize = require('./connection');
const Issue = require('./issue');

const Revision = sequelize.define('revision', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    issueId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Issue,
            key: 'id'
        },
        field: 'issue_id'
    },
    revisionData: {
        type: Sequelize.JSON,
        allowNull: false,
        field: 'revision_data'
    },
    changes: {
        type: Sequelize.JSON,
        allowNull: false
    },
    updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'updated_at'
    }
}, {
    timestamps: false,
    tableName: 'revisions'
});

Revision.belongsTo(Issue, { foreignKey: 'issueId' });

module.exports = Revision;