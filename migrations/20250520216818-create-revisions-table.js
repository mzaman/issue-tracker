'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('revisions', {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            issueId: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                field: 'issue_id',
                references: {
                    model: 'issues',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            revisionNumber: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                field: 'revision_number'
            },
            issueSnapshot: {
                type: Sequelize.JSON,
                allowNull: false,
                field: 'issue_snapshot'
            },
            changes: {
                type: Sequelize.JSON,
                allowNull: false
            },
            updatedBy: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                field: 'updated_by',
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                field: 'updated_at'
            }
        });

        await queryInterface.addConstraint('revisions', {
            fields: ['issue_id', 'revision_number'],
            type: 'unique',
            name: 'uniq_issue_revision_number'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('revisions');
    }
};