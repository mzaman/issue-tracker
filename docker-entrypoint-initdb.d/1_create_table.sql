-- CREATE DATABASE IF NOT EXISTS issue_db;
-- CREATE DATABASE IF NOT EXISTS issue_db_test;
-- CREATE DATABASE IF NOT EXISTS issue_db_prod;

-- USE issue_db;

-- CREATE TABLE IF NOT EXISTS issues (
--   id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
--   title VARCHAR(100) NOT NULL,
--   description TEXT NOT NULL,
--   created_by VARCHAR(100) NOT NULL,
--   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   updated_by VARCHAR(100),
--   updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- CREATE TABLE IF NOT EXISTS revisions (
--   id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
--   issue_id INT UNSIGNED NOT NULL,
--   revision_data JSON NOT NULL,
--   changes JSON NOT NULL,
--   updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (issue_id) REFERENCES issues(id)
-- );

-- INSERT INTO issues (title, description, created_by) VALUES
-- ('Initial Issue', 'This is the first seeded issue.', 'system');