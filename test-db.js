const { Client } = require('pg');
const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_p1gPhVQW5KlN@ep-falling-voice-aq1b07wx.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require",
});

async function test() {
  try {
    console.log("Connecting...");
    await client.connect();
    console.log("Connected!");
    const res = await client.query('SELECT NOW()');
    console.log(res.rows[0]);
    await client.end();
  } catch (err) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }
}

test();
