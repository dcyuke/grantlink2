import pg from 'pg'
import fs from 'fs'

const { Client } = pg

if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL environment variable.')
  console.error('Set it in .env.local or pass it directly: DATABASE_URL=postgresql://... node scripts/setup-database.mjs')
  process.exit(1)
}

// Supabase direct connection (uses the pooler)
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function run() {
  try {
    console.log('Connecting to Supabase...')
    await client.connect()
    console.log('Connected!')

    const sql = fs.readFileSync(new URL('./create-tables.sql', import.meta.url), 'utf8')
    console.log('Running schema migration...')
    await client.query(sql)
    console.log('Tables created successfully!')
  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    await client.end()
  }
}

run()
