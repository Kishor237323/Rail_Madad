import { compare } from 'bcryptjs'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import {
  AUTH_COOKIE_NAME,
  createAdminSessionToken,
  PREDEFINED_ADMIN_USERNAMES,
  SESSION_MAX_AGE_SECONDS,
} from '@/lib/server/auth'
import { getDatabase } from '@/lib/server/db'

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'Username is required')
    .max(50, 'Username is too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Invalid username format'),
  password: z.string().min(1, 'Password is required').max(128, 'Password is too long'),
})

type AdminDocument = {
  username: string
  password: string
  role: string
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json()
    const parsed = loginSchema.safeParse(rawBody)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Please enter valid username and password.' }, { status: 400 })
    }

    const { username, password } = parsed.data

    if (!PREDEFINED_ADMIN_USERNAMES.includes(username as (typeof PREDEFINED_ADMIN_USERNAMES)[number])) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const db = await getDatabase()
    const admin = await db.collection<AdminDocument>('admins').findOne({ username })

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isPasswordValid = await compare(password, admin.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = await createAdminSessionToken({
      username: admin.username,
      role: admin.role || 'admin',
    })

    const response = NextResponse.json({ success: true, redirectTo: '/admin/analytics' })
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Unable to process login request.' }, { status: 500 })
  }
}
