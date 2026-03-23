/**
 * Ethiopian Calendar Utilities
 *
 * The Ethiopian calendar (Ge'ez calendar) is 7-8 years behind the Gregorian calendar.
 * It has 13 months: 12 months of 30 days + 1 month (Pagume) of 5 or 6 days (leap year).
 * Ethiopian New Year starts on September 11 (or 12 in Ethiopian leap year) of the Gregorian calendar.
 */

const ETHIOPIAN_MONTHS_AM = [
  'መስከረም', // Meskerem (Sep)
  'ጥቅምት',   // Tikemet (Oct)
  'ህዳር',    // Hidar (Nov)
  'ታህሳስ',   // Tahsas (Dec)
  'ጥር',     // Tir (Jan)
  'የካቲት',   // Yekatit (Feb)
  'መጋቢት',   // Megabit (Mar)
  'ሚያዚያ',   // Miyazia (Apr)
  'ግንቦት',   // Ginbot (May)
  'ሰኔ',     // Sene (Jun)
  'ሐምሌ',    // Hamle (Jul)
  'ነሃሴ',    // Nehase (Aug)
  'ጳጉሜ',    // Pagume (intercalary month)
]

const ETHIOPIAN_MONTHS_EN = [
  'Meskerem', 'Tikemet', 'Hidar', 'Tahsas',
  'Tir', 'Yekatit', 'Megabit', 'Miyazia',
  'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume',
]

/**
 * Compute the Julian Day Number for a Gregorian date.
 * Uses the standard Meeus algorithm with Jan/Feb correction.
 */
function gregorianToJDN(gYear: number, gMonth: number, gDay: number): number {
  // Jan and Feb are treated as months 13 and 14 of the previous year
  let y = gYear
  let m = gMonth
  if (m <= 2) {
    y -= 1
    m += 12
  }
  const A = Math.floor(y / 100)
  const B = 2 - A + Math.floor(A / 4)
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + gDay + B - 1524
}

/**
 * Convert a JDN to Gregorian date components.
 */
function jdnToGregorian(jdn: number): { gYear: number; gMonth: number; gDay: number } {
  const l = jdn + 68569
  const n = Math.floor((4 * l) / 146097)
  const l2 = l - Math.floor((146097 * n + 3) / 4)
  const i = Math.floor((4000 * (l2 + 1)) / 1461001)
  const l3 = l2 - Math.floor((1461 * i) / 4) + 31
  const j = Math.floor((80 * l3) / 2447)
  const gDay = l3 - Math.floor((2447 * j) / 80)
  const l4 = Math.floor(j / 11)
  const gMonth = j + 2 - 12 * l4
  const gYear = 100 * (n - 49) + i + l4
  return { gYear, gMonth, gDay }
}

/**
 * Ethiopian calendar epoch: JDN of Meskerem 1, 1 EC
 * = August 29, 8 CE (Julian) = JDN 1724221
 */
const ETH_EPOCH_JDN = 1724221

/**
 * Get the JDN of the first day of a given Ethiopian year.
 */
function ethYearStartJDN(eYear: number): number {
  return ETH_EPOCH_JDN + (eYear - 1) * 365 + Math.floor((eYear - 1) / 4)
}

/**
 * Convert a Gregorian date to an Ethiopian date object.
 */
export function gregorianToEthiopian(date: Date): { year: number; month: number; day: number } {
  const gYear = date.getFullYear()
  const gMonth = date.getMonth() + 1
  const gDay = date.getDate()

  const jdn = gregorianToJDN(gYear, gMonth, gDay)

  // Estimate the Ethiopian year using 365.25 average year length
  let eYear = Math.floor((jdn - ETH_EPOCH_JDN) / 365.25) + 1

  // Adjust: move forward if we're still before the start of eYear
  while (ethYearStartJDN(eYear + 1) <= jdn) eYear++
  // Move backward if we overshot
  while (ethYearStartJDN(eYear) > jdn) eYear--

  const dayOfYear = jdn - ethYearStartJDN(eYear) // 0-based
  const eMonth = Math.floor(dayOfYear / 30) + 1
  const eDay = (dayOfYear % 30) + 1

  return { year: eYear, month: eMonth, day: eDay }
}

/**
 * Convert an Ethiopian date to a Gregorian Date object (local time, no UTC shift).
 */
export function ethiopianToGregorian(eYear: number, eMonth: number, eDay: number): Date {
  const jdn = ETH_EPOCH_JDN + (eYear - 1) * 365 + Math.floor((eYear - 1) / 4) + (eMonth - 1) * 30 + (eDay - 1)
  const { gYear, gMonth, gDay } = jdnToGregorian(jdn)
  // Use local date constructor to avoid UTC timezone shift (important for UTC+3 Ethiopia)
  return new Date(gYear, gMonth - 1, gDay)
}

/**
 * Format a local Date as YYYY-MM-DD (no UTC timezone shift).
 */
export function localDateToString(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/**
 * Format a Gregorian date as an Ethiopian date string for display.
 */
export function formatEthiopianDate(
  date: Date | string | null | undefined,
  locale: 'en' | 'am' = 'en'
): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date
  if (isNaN(d.getTime())) return '-'

  const { year, month, day } = gregorianToEthiopian(d)
  if (month < 1 || month > 13) return '-'
  const monthName = locale === 'am' ? ETHIOPIAN_MONTHS_AM[month - 1] : ETHIOPIAN_MONTHS_EN[month - 1]
  return `${day} ${monthName} ${year}`
}

/**
 * Get today's date in Ethiopian calendar.
 */
export function todayEthiopian(locale: 'en' | 'am' = 'en'): string {
  return formatEthiopianDate(new Date(), locale)
}

/**
 * Convert Gregorian date string (YYYY-MM-DD or full ISO timestamp) to Ethiopian display string.
 * Handles both plain dates from date columns and full timestamps from created_at fields.
 */
export function gregStrToEthiopian(dateStr: string, locale: 'en' | 'am' = 'en'): string {
  if (!dateStr) return '-'
  // Extract just the date portion if it's a full ISO timestamp (e.g. "2019-12-02T21:00:00.000Z")
  const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr
  return formatEthiopianDate(new Date(datePart + 'T00:00:00'), locale)
}
