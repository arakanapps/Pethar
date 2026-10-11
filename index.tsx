import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { users } from './drizzle/schema'

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.uklqksioruxvatwpvopm:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres'

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false })
const db = drizzle(client)

export { client, db, users }

export async function getUsers() {
  return await db.select().from(users)
}

export default db
