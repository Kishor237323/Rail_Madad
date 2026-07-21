import { SignJWT, jwtVerify } from 'jose'

export const AUTH_COOKIE_NAME = 'rm_admin_session'
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8

export const PREDEFINED_ADMIN_USERNAMES = [
  'admin1',
  'admin2',
  'supervisor',
  'railway_admin',
] as const

type AdminSessionPayload = {
  username: string
  role: string
}

function getJwtSecretKey() {
  const secret = process.env.AUTH_SECRET

  if (!secret) {
    throw new Error('Missing AUTH_SECRET environment variable.')
  }

  return new TextEncoder().encode(secret)
}

export async function createAdminSessionToken(payload: AdminSessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getJwtSecretKey())
}

export async function verifyAdminSessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey())

    if (
      typeof payload.username === 'string' &&
      PREDEFINED_ADMIN_USERNAMES.includes(payload.username as (typeof PREDEFINED_ADMIN_USERNAMES)[number])
    ) {
      return {
        username: payload.username,
        role: typeof payload.role === 'string' ? payload.role : 'admin',
      }
    }

    return null
  } catch {
    return null
  }
}
