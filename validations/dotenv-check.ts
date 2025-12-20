import { z } from 'zod'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import * as fs from 'fs'
import * as path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const envPath = path.resolve(__dirname, '..', '.env')
if (!fs.existsSync(envPath)) {
  console.error('.env file not found in the project root.')
  process.exit(1)
}

config({ path: envPath })

export const envSchema = z.object({
  TOKI_DATABASE_URL: z.string().url(),
  TOKI_NWPUSHARE_SITE_URL: z.string().url(),

  NEXT_PUBLIC_NWPUSHARE_ADDRESS_DEV: z.string(),
  NEXT_PUBLIC_NWPUSHARE_ADDRESS_PROD: z.string(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.string(),

  JWT_ISS: z.string(),
  JWT_AUD: z.string(),
  JWT_SECRET: z.string(),

  NODE_ENV: z.enum(['development', 'test', 'production']),

  TOKI_NWPUSHARE_EMAIL_FROM: z.string(),
  TOKI_NWPUSHARE_EMAIL_HOST: z.string(),
  TOKI_NWPUSHARE_EMAIL_PORT: z.string(),
  TOKI_NWPUSHARE_EMAIL_ACCOUNT: z.string(),
  TOKI_NWPUSHARE_EMAIL_PASSWORD: z.string(),

  TOKI_NWPUSHARE_S3_STORAGE_ACCESS_KEY_ID: z.string(),
  TOKI_NWPUSHARE_S3_STORAGE_SECRET_ACCESS_KEY: z.string(),
  TOKI_NWPUSHARE_S3_STORAGE_BUCKET_NAME: z.string(),
  TOKI_NWPUSHARE_S3_STORAGE_ENDPOINT: z.string(),
  TOKI_NWPUSHARE_S3_STORAGE_REGION: z.string(),
  NEXT_PUBLIC_TOKI_NWPUSHARE_S3_STORAGE_URL: z.string(),

  TOKI_NWPUSHARE_IMAGE_BED_HOST: z.string(),
  TOKI_NWPUSHARE_IMAGE_BED_URL: z.string(),

  KUN_CF_CACHE_ZONE_ID: z.string(),
  KUN_CF_CACHE_PURGE_API_TOKEN: z.string(),

  TOKI_NWPUSHARE_INDEX_NOW_KEY: z.string(),

  TOKI_NWPUSHARE_TEST_SITE_LABEL: z.string().optional()
})

export const env = envSchema.safeParse(process.env)

if (!env.success) {
  throw new Error(
    '❌ Invalid environment variables: ' +
      JSON.stringify(env.error.format(), null, 4)
  )
}
