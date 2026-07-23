const fs = require('fs');
let content = fs.readFileSync('packages/db/schema.sql', 'utf8');

// Tables
content = content.replace(/CREATE TABLE "(\w+)"/g, 'CREATE TABLE IF NOT EXISTS "$1"');

// Indexes
content = content.replace(/CREATE INDEX "(\w+)"/g, 'CREATE INDEX IF NOT EXISTS "$1"');
content = content.replace(/CREATE UNIQUE INDEX "(\w+)"/g, 'CREATE UNIQUE INDEX IF NOT EXISTS "$1"');

// Policies
content = content.replace(/CREATE POLICY (\w+) ON "(\w+)"/g, 'DROP POLICY IF EXISTS $1 ON "$2";\nCREATE POLICY $1 ON "$2"');

fs.writeFileSync('packages/db/schema.sql', content);
console.log('Done!');
