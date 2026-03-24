import { useState } from 'react'
import { DEFAULT_ENTRY } from '../types'
import { saveEntry, generateId } from '../utils/storage'
import type { Entry } from '../types'

type FormState = Omit<Entry, 'id' | 'timestamp'>

export function useEntryForm() {
  const [form, setForm] = useState<FormState>(DEFAULT_ENTRY)
  const [submitted, setSubmitted] = useState(false)

  function handleChange<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSubmit() {
    const entry: Entry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      ...form,
    }
    saveEntry(entry)
    setForm(DEFAULT_ENTRY)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return { form, submitted, handleChange, handleSubmit }
}
