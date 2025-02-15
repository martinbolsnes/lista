import jwt, { type JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export async function getUserIdFromToken(
  request: Request
): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = request; // ✅ Ignore request without removing it
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    if (typeof decoded === 'object' && 'userId' in decoded) {
      return decoded.userId as string;
    }
    return null;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}
