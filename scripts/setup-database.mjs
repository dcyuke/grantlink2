import pg from 'pg'
import fs from 'fs'

const { Client } = pg

// Supabase direct connection (uses the pooler)
const client = new Client({
  connectionString: 'postgresql://postgres.ropbumeuuddufswrjfva:GrantLink2026!@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
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
