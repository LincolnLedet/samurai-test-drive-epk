// Site content. Edit this file to update bios, photos, shows, stage plot, etc.

export const name = 'Samurai Test Drive'
export const email = 'samuraitestdrive@gmail.com'
export const instagramUrl = 'https://www.instagram.com/samuraitestdrive/'
export const instagramHandle = '@samuraitestdrive'

export const shortBio =
  "Samurai Test Drive is a five-piece jazz fusion band based out of Athens, GA. Taking inspiration from artists like Casiopea, Return to Forever, Lettuce, and Jaco Pastorius, they revive the almost-forgotten sound of '80s jazz fusion."

export const longBio = [
  'Samurai Test Drive is a five-piece jazz fusion band based out of Athens, GA. Taking inspiration from artists like Casiopea, Return to Forever, Lettuce, and Jaco Pastorius, they captivate audiences with a stylish and infectious sound that you can’t help but groove along to.',
  'The band is made up of Ashton Rugh on drums, Jason Angelich on guitar, Joseph Key on bass, Lincoln Ledet on keys, and Marc Luliucci on saxophone. Together, they create a jazzy but danceable sound that leaves you on the edge of your seat.',
]

export const videos = ['JNIBdSQBqc0', 'E3-uRS1rp0Y', '_RLv0wGiZJo']

// Photos shown in the About section.
// Drop image files in /public/photos/ and reference them by /photos/filename.webp.
// Leave the array empty to hide the grid entirely.
// To re-compress new additions to WebP, run: node scripts/convert-to-webp.mjs
// Credit: photos by Keegan Nelson.
export const photos = [
  { src: '/photos/keegannelson_samuraitestdrive-5.webp', alt: 'Samurai Test Drive — live' },
  { src: '/photos/keegannelson_samuraitestdrive-11.webp', alt: 'Samurai Test Drive — live' },
  { src: '/photos/keegannelson_samuraitestdrive-20.webp', alt: 'Samurai Test Drive — live' },
  { src: '/photos/keegannelson_samuraitestdrive-21.webp', alt: 'Samurai Test Drive — live' },
  { src: '/photos/keegannelson_samuraitestdrive-24.webp', alt: 'Samurai Test Drive — live' },
  { src: '/photos/693466821_17863788894685736_3091505192127098172_n.webp', alt: 'Samurai Test Drive — live' },
]

// All upcoming shows. The calendar reads from here, and the home-page flier
// auto-selects the earliest upcoming event.
//
// Optional fields:
//   poster:  '/posters/yourfile.webp' — drop the image file in /public/posters/.
//                                       When set, the poster is shown in the flier.
//   support: '...'                    — leave as '' (or omit) if headlining alone.
//   tickets: ''                       — leave empty when ticketing isn't live yet;
//                                       the UI swaps "Get Tickets" → "More info soon".
export const events = [
  {
    date: '2026-06-27',
    time: '12:00 AM',
    doors: '9:00 PM',
    venue: 'Live Wire',
    city: 'Athens, GA',
    support: 'with Frute',
    price: 'Athfest Club Crawl Pass',
    tickets: 'https://www.ticketsignup.io/TicketEvent/AthFest2026',
    poster: '/posters/athfest-2026.webp',
  },
  {
    date: '2026-07-23',
    time: 'TBD',
    doors: 'TBD',
    venue: 'Nowhere Bar',
    city: 'Athens, GA',
    support: 'with Krikos',
    price: 'TBD',
    tickets: '',
  },
  {
    date: '2026-08-03',
    time: 'TBD',
    doors: 'TBD',
    venue: 'Nowhere Bar',
    city: 'Athens, GA',
    support: '',
    price: 'TBD',
    tickets: '',
  },
]

// Helper: format ISO date to a long human string.
export function formatLongDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// All events on/after today, in chronological order.
export function getUpcomingShows(today = new Date()) {
  const todayIso = today.toISOString().slice(0, 10)
  return events.filter((e) => e.date >= todayIso)
}

// "JUL 10" style.
export function formatShortDate(iso) {
  const d = new Date(iso + 'T00:00:00')
  const m = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  return `${m} ${d.getDate()}`
}

// Stage plot — laid out on a 6-column, 2-row grid so the front row (2 items)
// can sit centered between the back row (3 items).
//
//   [ Keys ][ Drums ][ Bass ]      ← back
//      [ Guitar ][ Sax ]            ← front
export const stagePlot = [
  { label: 'Keys', sub: 'DI (mono)', gridColumn: '1 / 3', gridRow: 1 },
  { label: 'Drums', sub: 'Standard kit + talking mic', gridColumn: '3 / 5', gridRow: 1 },
  { label: 'Bass', sub: 'DI', gridColumn: '5 / 7', gridRow: 1 },
  { label: 'Guitar', sub: 'SM57', gridColumn: '2 / 4', gridRow: 2 },
  { label: 'Sax', sub: 'SM57', gridColumn: '4 / 6', gridRow: 2 },
]

export const inputList = [
  { ch: 1, source: 'Kick', mic: 'Beta 52' },
  { ch: 2, source: 'Snare', mic: 'SM57' },
  { ch: 3, source: 'Overhead L', mic: 'Condenser' },
  { ch: 4, source: 'Overhead R', mic: 'Condenser' },
  { ch: 5, source: 'Bass', mic: 'DI' },
  { ch: 6, source: 'Keys', mic: 'DI (mono)' },
  { ch: 7, source: 'Guitar', mic: 'SM57' },
  { ch: 8, source: 'Sax', mic: 'SM57' },
  { ch: 9, source: 'Hot Mic (Drums)', mic: 'SM58 — talkback' },
]
