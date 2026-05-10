const { Pool } = require('@neondatabase/serverless');
const ws = require('ws');
require('@neondatabase/serverless').neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: "postgresql://neondb_owner:npg_KbX9AdlGHo3r@ep-falling-voice-aq1b07wx.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require" });

pool.query('SELECT NOW()').then(res => {
  console.log(res.rows);
  pool.end();
}).catch(console.error);
