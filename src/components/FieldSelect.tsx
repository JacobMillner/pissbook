interface Option {
  value: string | number
  label: string
}

interface FieldSelectProps {
  name: string
  label: string
  hint?: string
  options: readonly Option[]
  value: string | number
  onChange: (value: string | number) => void
}

export default function FieldSelect({
  name, label, hint, options, value, onChange
}: FieldSelectProps) {
  return (
    <div className="field-group">
      <label htmlFor={name}>{label}</label>
      {hint && <span className="field-hint">{hint}</span>}
      <select
        id={name}
        data-testid={`field-${name}`}
        value={String(value)}
        onChange={e => {
          const raw = e.target.value
          const asNum = Number(raw)
          onChange(isNaN(asNum) ? raw : asNum)
        }}
      >
        {options.map(opt => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
