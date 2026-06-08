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

try {
  await client.connect();
  console.log("Connected to Supabase database");

  await client.query(`
    CREATE TABLE IF NOT EXISTS containers (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      bl_no TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `);
  console.log("Created containers table");

  await client.query(`
    ALTER TABLE containers DISABLE ROW LEVEL SECURITY
  `);
  console.log("Disabled RLS on containers table");

  console.log("Database setup complete!");
} catch (err) {
  console.error("Error:", err.message);
} finally {
  await client.end();
}
