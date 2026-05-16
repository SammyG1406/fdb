import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.MEALDB_URL
});

export default pool;