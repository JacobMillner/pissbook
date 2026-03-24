import type { Entry } from '../types'

export type TrendSeverity = 'info' | 'warning' | 'alert'

export interface Trend {
  field: keyof Entry
  severity: TrendSeverity
  title: string
  description: string
}

/**
 * Analyse an array of entries and return a list of notable trends.
 * Rules are intentionally simple: if >50% of entries in the window
 * show an abnormal value for a field, flag it.
 */
export function analyseTrends(entries: Entry[]): Trend[] {
  if (entries.length === 0) return []

  const trends: Trend[] = []
  const n = entries.length

  // Helper: count how many entries match a predicate
  function pct(fn: (e: Entry) => boolean): number {
    return entries.filter(fn).length / n
  }

  // --- Nitrite ---
  if (pct(e => e.nitrite === 'positive') > 0.5) {
    trends.push({
      field: 'nitrite',
      severity: 'alert',
      title: 'Nitrite Positive',
      description: `${Math.round(pct(e => e.nitrite === 'positive') * 100)}% of readings in this period show positive nitrite. This may indicate a bacterial infection — consider consulting a doctor.`,
    })
  }

  // --- Leukocytes ---
  if (pct(e => typeof e.leukocytes === 'number' && e.leukocytes >= 70) > 0.5) {
    trends.push({
      field: 'leukocytes',
      severity: 'warning',
      title: 'Elevated Leukocytes',
      description: 'More than half your readings show elevated white blood cells, which can signal inflammation or infection.',
    })
  }

  // --- Ketones ---
  if (pct(e => typeof e.ketone === 'number' && e.ketone >= 4.0) > 0.5) {
    trends.push({
      field: 'ketone',
      severity: 'warning',
      title: 'Moderate-High Ketones',
      description: 'Sustained elevated ketones may indicate prolonged fasting, very low carb intake, or metabolic changes.',
    })
  }

  // --- Bilirubin ---
  if (pct(e => typeof e.bilirubin === 'number' && e.bilirubin >= 50) > 0.5) {
    trends.push({
      field: 'bilirubin',
      severity: 'warning',
      title: 'Elevated Bilirubin',
      description: 'Consistently elevated bilirubin may relate to liver or gallbladder function. Consider seeking medical advice.',
    })
  }

  // --- Protein ---
  if (pct(e => typeof e.protein === 'number' && e.protein >= 1.0) > 0.5) {
    trends.push({
      field: 'protein',
      severity: 'warning',
      title: 'Elevated Protein',
      description: 'Significant protein in urine (proteinuria) can be an early sign of kidney stress.',
    })
  }

  // --- Hydration ---
  if (pct(e => e.hydration === 'under_hydrated' || e.hydration === 'severely_dehydrated') > 0.5) {
    trends.push({
      field: 'hydration',
      severity: 'info',
      title: 'Frequent Under-Hydration',
      description: "You're often reading as under-hydrated. Try increasing your daily water intake.",
    })
  }

  // --- pH extremes ---
  if (pct(e => e.ph <= 5.0) > 0.5) {
    trends.push({
      field: 'ph',
      severity: 'info',
      title: 'Consistently Acidic pH',
      description: 'A persistently low urine pH can indicate a high-protein or high-acid diet.',
    })
  }
  if (pct(e => e.ph >= 8.0) > 0.5) {
    trends.push({
      field: 'ph',
      severity: 'info',
      title: 'Consistently Alkaline pH',
      description: 'A persistently high urine pH may indicate a UTI or certain dietary patterns.',
    })
  }

  // --- Free Radicals ---
  if (pct(e => typeof e.freeRadical === 'number' && e.freeRadical >= 3) > 0.5) {
    trends.push({
      field: 'freeRadical',
      severity: 'info',
      title: 'Elevated Free Radicals',
      description: 'Sustained high free radical readings may suggest increased oxidative stress. Antioxidant-rich foods can help.',
    })
  }

  return trends
}
