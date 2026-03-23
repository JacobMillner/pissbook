import { describe, it, expect } from 'vitest'
import {
  HYDRATION_OPTIONS,
  UROBILINOGEN_OPTIONS,
  BILIRUBIN_OPTIONS,
  NITRITE_OPTIONS,
  PH_OPTIONS,
} from '../types'

describe('field option constants', () => {
  it('hydration has 4 options', () => {
    expect(HYDRATION_OPTIONS).toHaveLength(4)
  })
  it('urobilinogen options are numbers', () => {
    UROBILINOGEN_OPTIONS.forEach(o => expect(typeof o.value).toBe('number'))
  })
  it('bilirubin has neg option', () => {
    expect(BILIRUBIN_OPTIONS[0].value).toBe('neg')
  })
  it('ph options include 7.0', () => {
    expect(PH_OPTIONS.map(o => o.value)).toContain(7.0)
  })
  it('nitrite only has neg and positive', () => {
    expect(NITRITE_OPTIONS).toHaveLength(2)
  })
})
