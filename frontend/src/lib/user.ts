export function getFullName(user: { firstName: string; lastName: string }): string {
  return [user.firstName, user.lastName].filter(Boolean).join(' ');
}

export function getInitials(user: { firstName: string; lastName: string }): string {
  return [user.firstName, user.lastName]
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
