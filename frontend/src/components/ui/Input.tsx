import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const BASE =
  'w-full rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-text outline-none transition-shadow duration-150 enabled:focus:border-primary enabled:focus:ring-2 enabled:focus:ring-primary/15 read-only:focus:!border-border read-only:focus:!ring-0 disabled:cursor-not-allowed disabled:opacity-50';

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(BASE, className)} {...props} />;
}

export function Textarea({
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(BASE, className)} {...props} />;
}
