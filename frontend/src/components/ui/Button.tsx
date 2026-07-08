import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-gradient-to-b from-primary to-primary-hover text-white shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 hover:-translate-y-px active:translate-y-0',
  secondary:
    'border border-border bg-surface text-text shadow-sm hover:border-primary/40 hover:-translate-y-px active:translate-y-0',
  ghost: 'text-text hover:bg-surface',
  danger:
    'bg-gradient-to-b from-priority-urgent to-priority-urgent text-white shadow-sm shadow-priority-urgent/20 hover:opacity-90 hover:-translate-y-px active:translate-y-0',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150 ease-out cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  );
}
