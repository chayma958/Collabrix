import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/cn';
import { ChevronDownIcon } from './icons';

interface OptionProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
}

export function Option(_props: OptionProps) {
  return null;
}

interface ParsedOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

function parseOptions(children: ReactNode): ParsedOption[] {
  const options: ParsedOption[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement<OptionProps>(child) && child.type === Option) {
      options.push({
        value: child.props.value,
        label: child.props.children,
        disabled: child.props.disabled,
      });
    }
  });
  return options;
}

export function Select({
  value,
  onChange,
  children,
  className = '',
  disabled = false,
  placeholder = '—',
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const options = parseOptions(children);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-bg px-3 py-1.5 text-left text-sm text-text outline-none transition-shadow duration-150 enabled:focus:border-primary enabled:focus:ring-2 enabled:focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={cn('truncate', !selected && 'text-muted')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDownIcon
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-muted transition-transform duration-150',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="animate-fade-in absolute left-0 right-0 z-40 mt-1 max-h-60 overflow-y-auto rounded-md border border-border bg-surface py-1 text-sm shadow-lg"
        >
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                disabled={option.disabled}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  'block w-full px-3 py-1.5 text-left transition-colors duration-100 hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-50',
                  option.value === value ? 'bg-primary/10 font-medium text-primary' : 'text-text',
                )}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
