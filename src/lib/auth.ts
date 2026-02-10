import { cookies } from 'next/headers';
import { type Role, type UserClaims } from '@/types/auth';

export async function getRoleFromCookies(): Promise<Role | undefined> {
  // Placeholder: server-side only, assumes a non-sensitive role cookie for routing demo only.
  const cookieStore = await cookies();
  const role = cookieStore.get('role')?.value as Role | undefined;
  return role;
}

export async function getUserClaims(): Promise<
  Partial<UserClaims> | undefined
> {
  // Placeholder: in production, decode/verify JWT on the server.
  const role = await getRoleFromCookies();
  if (!role) return undefined;
  return { role };
}
