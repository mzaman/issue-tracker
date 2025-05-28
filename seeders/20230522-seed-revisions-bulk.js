'use strict';

const { faker } = require('@faker-js/faker');
const _ = require('lodash');

module.exports = {
    up: async (queryInterface) => {
        const revisions = [];
        const issueId = 1;
        const baseDate = new Date();

        // Helper: deep diff to get changes between two objects
        function deepDiff(obj1, obj2, prefix = '') {
            const changes = {};
            const keys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

            for (const key of keys) {
                const val1 = obj1 ? obj1[key] : undefined;
                const val2 = obj2 ? obj2[key] : undefined;
                const fullKey = prefix ? `${prefix}.${key}` : key;

                if (_.isEqual(val1, val2)) continue;

                if (_.isObject(val1) && _.isObject(val2)) {
                    Object.assign(changes, deepDiff(val1, val2, fullKey));
                } else {
                    changes[fullKey] = { from: val1, to: val2 };
                }
            }

            return changes;
        }

        // Initialize previous revision data for comparison
        let prevData = {
            title: 'Initial Issue Title',
            description: faker.lorem.sentences(3),
            metadata: {
                priority: 'medium',
                tags: ['tag1', 'tag2']
            }
        };

        for (let i = 1; i <= 1000; i++) {
            // Mutate some fields realistically
            const title = i % 10 === 0 ? `Issue title version ${i} (updated)` : prevData.title;
            const description = i % 15 === 0 ? faker.lorem.sentences(2 + (i % 5)) : prevData.description;

            // Slightly change metadata priority and tags every 5 revisions
            const priorityOptions = ['low', 'medium', 'high'];
            const priority = (i % 5 === 0)
                ? priorityOptions[(priorityOptions.indexOf(prevData.metadata.priority) + 1) % priorityOptions.length]
                : prevData.metadata.priority;

            const tags = (i % 7 === 0)
                ? [`tag${i % 5}`, `tag${(i + 1) % 5}`]
                : prevData.metadata.tags;

            const revisionData = {
                title,
                description,
                metadata: {
                    priority,
                    tags
                }
            };

            // Calculate changes vs previous revision
            const changes = deepDiff(prevData, revisionData);

            revisions.push({
                issue_id: issueId,
                revision_data: JSON.stringify(revisionData),
                changes: JSON.stringify(changes),
                updated_at: new Date(baseDate.getTime() + i * 60000) // spaced by 1 minute
            });

            // Update prevData to current for next iteration
            prevData = revisionData;
        }

        // await queryInterface.bulkInsert('revisions', revisions);
    },

    down: async (queryInterface) => {
        // await queryInterface.bulkDelete('revisions', { issue_id: 1 });
    }
};