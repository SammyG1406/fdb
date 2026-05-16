import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.FOODDB_URL
});

export default pool;
