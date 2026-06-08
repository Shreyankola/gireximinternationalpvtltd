import pg from "pg";
const { Client } = pg;
const client = new Client({
  host: "db.hfsivkkdgkydaxckfjfq.supabase.co",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: "GIREXIM@GIREXIM",
  ssl: { rejectUnauthorized: false },
});
await client.connect();
await client.query("ALTER TABLE containers ADD COLUMN IF NOT EXISTS container_count TEXT DEFAULT ''");
console.log("Column container_count added successfully");
await client.end();
