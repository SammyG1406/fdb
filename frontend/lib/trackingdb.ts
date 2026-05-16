import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.TRACKINGDB_URL
});

export default pool;