import { query } from '../data/db';

(async () => {
  try {
    const result = await query<{ now: string }>('SELECT NOW()');
    console.log('DB connected, time is:', result.rows[0].now);
  } catch (err) {
    console.error('DB connection failed:', err);
  }
})();
