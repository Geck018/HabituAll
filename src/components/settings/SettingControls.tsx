type SettingToggleProps = {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function SettingToggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: SettingToggleProps) {
  return (
    <label
      className={`flex items-start justify-between gap-4 rounded-xl border border-border bg-surface-raised p-4 ${
        disabled ? 'opacity-60' : 'cursor-pointer'
      }`}
    >
      <div className="min-w-0">
        <span className="block font-medium text-text">{label}</span>
        {description && (
          <span className="mt-0.5 block text-sm text-text-muted">{description}</span>
        )}
      </div>
      <input
        type="checkbox"
        className="mt-1 size-5 shrink-0 rounded border-border text-accent focus:ring-accent"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  )
}

type SettingSelectProps<T extends string> = {
  label: string
  description?: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}

export function SettingSelect<T extends string>({
  label,
  description,
  value,
  options,
  onChange,
}: SettingSelectProps<T>) {
  return (
    <div className="rounded-xl border border-border bg-surface-raised p-4">
      <label className="block">
        <span className="block font-medium text-text">{label}</span>
        {description && (
          <span className="mt-0.5 block text-sm text-text-muted">{description}</span>
        )}
        <select
          className="mt-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

type SettingSectionProps = {
  title: string
  description?: string
  children: React.ReactNode
}

export function SettingSection({ title, description, children }: SettingSectionProps) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-text">{title}</h2>
        {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  )
}
