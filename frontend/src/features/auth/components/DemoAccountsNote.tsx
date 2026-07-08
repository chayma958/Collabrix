const DEMO_ACCOUNTS = [
  { email: 'alice@example.com', role: 'Owner' },
  { email: 'bob@example.com', role: 'Admin' },
  { email: 'carol@example.com', role: 'Member' },
  { email: 'dave@example.com', role: 'Viewer' },
];

export function DemoAccountsNote() {
  return (
    <div className="rounded-md border border-border bg-surface p-3 text-xs text-muted">
      <p className="mb-1.5 font-medium text-text">Just exploring? Use a demo account:</p>
      <ul className="space-y-0.5">
        {DEMO_ACCOUNTS.map((account) => (
          <li key={account.email}>
            {account.email} <span className="text-muted/70">({account.role})</span>
          </li>
        ))}
      </ul>
      <p className="mt-1.5">
        Password for all: <span className="font-medium text-text">password123</span>
      </p>
    </div>
  );
}
