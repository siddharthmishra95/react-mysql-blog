// One-off script: creates the database (if missing) and applies schema.sql.
// Usage: npm run db:init
import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbName = process.env.DB_NAME || 'react_mysql_blog';

async function main() {
  // Connect without selecting a database so we can create it.
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await connection.query(`USE \`${dbName}\``);

  const schema = await readFile(join(__dirname, 'schema.sql'), 'utf8');
  await connection.query(schema);

  console.log(`Database "${dbName}" is ready and schema applied.`);
  await connection.end();
}

main().catch((err) => {
  console.error('Database init failed:', err.message);
  process.exit(1);
});
