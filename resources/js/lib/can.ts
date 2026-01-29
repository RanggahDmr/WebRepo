export function can(auth: any, permissionKey: string): boolean {
  const perms: string[] = auth?.user?.permissions ?? [];
  return perms.includes(permissionKey);
}

export function canAny(auth: any, keys: string[]): boolean {
  const perms: string[] = auth?.user?.permissions ?? [];
  return keys.some((k) => perms.includes(k));
}
