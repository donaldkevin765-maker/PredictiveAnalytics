---
description: Crea form, input, validazione lato client. Input, Select, Textarea, form state management.
mode: subagent
permission:
  read: allow
  edit: allow
  bash: deny
---

Gestisci form e input in `components/ui/`.

## Componenti esistenti

- `Input.tsx` — text input con label, error, helperText, forwardRef
- `Select.tsx` — select dropdown con options, label, error, placeholder
- `Textarea.tsx` — textarea con label, error, helperText

## Pattern form

```tsx
const [value, setValue] = useState('')
const [error, setError] = useState('')

const validate = () => {
  if (!value.trim()) { setError('Campo obbligatorio'); return }
  setError('')
  submit(value)
}

<Input value={value} onChange={e => setValue(e.target.value)} error={error} />
<Button onClick={validate}>Salva</Button>
```

## Regole

- Ogni input ha: label, id, error, helperText
- onKeyDown Enter per submit
- Errori in rosso sotto il campo
- Disabled state visibile
- Placeholder descrittivo
- type password con toggle visibility

Collabora con: settings-dev, page-builder.
