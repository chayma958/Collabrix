import type { User } from '@/types/user';
import { getFullName, getInitials } from '@/lib/user';

const GRADIENTS = [
  'from-emerald-400 to-teal-600',
  'from-sky-400 to-blue-600',
  'from-violet-400 to-purple-600',
  'from-amber-400 to-orange-600',
  'from-rose-400 to-pink-600',
  'from-cyan-400 to-sky-600',
  'from-fuchsia-400 to-violet-600',
  'from-lime-400 to-emerald-600',
];

function gradientFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export function Avatar({
  user,
  size = 24,
}: {
  user: Pick<User, 'firstName' | 'lastName' | 'avatarUrl'>;
  size?: number;
}) {
  const fullName = getFullName(user);
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={fullName}
        style={{ width: size, height: size }}
        className="rounded-full object-cover shadow-sm ring-2 ring-bg"
      />
    );
  }
  return (
    <span
      title={fullName}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br font-medium text-white shadow-sm ring-2 ring-bg ${gradientFor(fullName || 'U')}`}
    >
      {getInitials(user)}
    </span>
  );
}
