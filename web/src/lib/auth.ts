import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(
  process.env.ADMIN_SESSION_SECRET || 'your-secret-key-change-in-production'
);

const SESSION_COOKIE_NAME = 'admin-session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function createSession() {
  const token = await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);

  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/'
  });

  return token;
}

export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload.admin === true;
  } catch (error) {
    return false;
  }
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}
