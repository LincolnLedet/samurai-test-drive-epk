import { useState, useMemo, useEffect } from 'react'
import {
  name,
  email,
  instagramUrl,
  instagramHandle,
  shortBio,
  longBio,
  videos,
  photos,
  events,
  formatLongDate,
  formatShortDate,
  getUpcomingShows,
  stagePlot,
  inputList,
} from './data.js'

const pages = ['Home', 'About', 'Video', 'Calendar', 'Stage', 'Booking']

const SITE_URL = 'https://samuritestdrive.band'

// Injects a <script type="application/ld+json"> into <head> for the lifetime of
// the component. Used to add page-specific Schema.org structured data.
function JsonLd({ data }) {
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(data)
    document.head.appendChild(script)
    return () => {
      script.remove()
    }
  }, [data])
  return null
}

// Build a Schema.org MusicEvent from an event row.
function eventSchema(event) {
  const hasVenue = event.venue && event.venue !== 'TBD'
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicEvent',
    name: `${name}${hasVenue ? ` at ${event.venue}` : ''}`,
    startDate: `${event.date}T00:00:00`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'MusicVenue',
      name: hasVenue ? event.venue : 'TBA',
      address: event.city || '',
    },
    performer: {
      '@type': 'MusicGroup',
      name,
      url: SITE_URL,
    },
    ...(event.tickets
      ? {
          offers: {
            '@type': 'Offer',
            url: event.tickets,
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
    ...(event.poster ? { image: `${SITE_URL}${event.poster}` } : {}),
  }
}

// Map page names to URL paths (Home lives at "/").
const pathFor = (page) => (page === 'Home' ? '/' : `/${page.toLowerCase()}`)
const pageFor = (pathname) => {
  if (pathname === '/' || pathname === '') return 'Home'
  const slug = pathname.replace(/^\/+/, '').replace(/\/+$/, '').toLowerCase()
  return pages.find((p) => p.toLowerCase() === slug) ?? 'Home'
}

function ShowFlier({ event, big }) {
  if (!event) return null

  // Compact layout (used wherever there's a poster): poster + info side-by-side on the
  // big home flier, stacked vertically in the narrower calendar/inline contexts.
  if (event.poster) {
    return (
      <div className={`${big ? 'border-4' : 'border-2'} border-black p-5 sm:p-8`}>
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] mb-4 sm:mb-5 text-center">
          Live in Concert
        </p>
        <div
          className={`flex flex-col items-center justify-center gap-5 ${
            big ? 'sm:flex-row sm:gap-8' : ''
          }`}
        >
          <img
            src={event.poster}
            alt={`${name} at ${event.venue}`}
            className={`block w-full max-w-[260px] border border-black ${
              big ? 'sm:w-64 sm:max-w-none sm:flex-shrink-0' : ''
            }`}
          />
          <div className="flex-1 w-full flex flex-col items-center text-center">
            <p className="text-xl sm:text-3xl font-bold uppercase leading-tight">
              {formatLongDate(event.date)}
            </p>
            <p className="text-xs sm:text-sm uppercase tracking-wide text-neutral-600 mt-1">
              Doors {event.doors} · Show {event.time}
            </p>
            <div className="my-4 sm:my-5 border-y-2 border-black py-3 w-full">
              <p className="text-lg sm:text-xl font-semibold">{event.venue}</p>
              <p className="text-neutral-600 text-sm sm:text-base">{event.city}</p>
              {event.support && (
                <p className="text-sm sm:text-base mt-1 text-neutral-600">{event.support}</p>
              )}
            </div>
            <p className="text-base sm:text-lg font-medium mb-4 sm:mb-5">{event.price}</p>
            {event.tickets ? (
              <a
                href={event.tickets}
                className="inline-block border-2 border-black px-6 sm:px-8 py-2.5 sm:py-3 font-bold uppercase tracking-wide text-sm sm:text-base hover:bg-black hover:text-white transition-colors"
              >
                Get Tickets
              </a>
            ) : (
              <p className="text-xs sm:text-sm uppercase tracking-widest text-neutral-500">
                More info soon
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Default layout: text-heavy flier (used on home when no poster, and on Calendar).
  const wrapper = big
    ? 'border-4 border-black text-center'
    : 'border-2 border-black text-center'
  const heading = big
    ? 'text-4xl sm:text-7xl font-black uppercase leading-none break-words'
    : 'text-2xl sm:text-4xl font-black uppercase leading-none break-words'
  const innerPadding = big ? 'p-5 sm:p-12' : 'p-5 sm:p-8'

  return (
    <div className={wrapper}>
      <div className={`${innerPadding} space-y-4 sm:space-y-5`}>
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em]">Live in Concert</p>
        <h2 className={heading}>{name}</h2>
        {event.support && <p className="text-sm sm:text-base">{event.support}</p>}
        <div className="border-y-2 border-black py-4 sm:py-5 space-y-1">
          <p className="text-lg sm:text-2xl font-bold uppercase">{formatLongDate(event.date)}</p>
          <p className="text-xs sm:text-sm uppercase tracking-wide text-neutral-600">
            Doors {event.doors} · Show {event.time}
          </p>
          <p className="text-base sm:text-xl font-semibold pt-1">{event.venue}</p>
          <p className="text-neutral-600 text-sm sm:text-base">{event.city}</p>
        </div>
        <p className="text-base sm:text-lg font-medium">{event.price}</p>
        {event.tickets ? (
          <a
            href={event.tickets}
            className="inline-block border-2 border-black px-6 sm:px-8 py-3 font-bold uppercase tracking-wide hover:bg-black hover:text-white transition-colors"
          >
            Get Tickets
          </a>
        ) : (
          <p className="text-xs sm:text-sm uppercase tracking-widest text-neutral-500">
            More info soon
          </p>
        )}
      </div>
    </div>
  )
}

function UpcomingList({ shows }) {
  return (
    <section>
      <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-3">More Shows</h2>
      <ul className="border-y border-neutral-200 divide-y divide-neutral-200">
        {shows.map((s) => {
          const inner = (
            <>
              <span className="font-bold uppercase text-sm tabular-nums w-14 sm:w-16 shrink-0">
                {formatShortDate(s.date)}
              </span>
              <span className="flex-1 min-w-0">
                <p className="font-medium truncate">{s.venue}</p>
                <p className="text-xs sm:text-sm text-neutral-500 truncate">
                  {s.city}
                  {s.support && ` · ${s.support}`}
                </p>
              </span>
              <span className="text-xs uppercase tracking-wide whitespace-nowrap">
                {s.tickets ? 'Tickets ›' : 'TBA'}
              </span>
            </>
          )
          return (
            <li key={s.date}>
              {s.tickets ? (
                <a
                  href={s.tickets}
                  className="flex items-center gap-3 sm:gap-4 py-3 hover:bg-neutral-50"
                >
                  {inner}
                </a>
              ) : (
                <div className="flex items-center gap-3 sm:gap-4 py-3 text-neutral-500">
                  {inner}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Flier() {
  const upcoming = useMemo(() => getUpcomingShows(), [])
  if (upcoming.length === 0) {
    return (
      <section className="border-4 border-black p-8 text-center space-y-3">
        <h1 className="text-4xl sm:text-7xl font-black uppercase">{name}</h1>
        <p className="text-neutral-500">No shows on the calendar — check back soon.</p>
      </section>
    )
  }
  const [next, ...rest] = upcoming
  return (
    <div className="space-y-8 sm:space-y-10">
      {upcoming.map((e) => (
        <JsonLd key={e.date} data={eventSchema(e)} />
      ))}
      <ShowFlier event={next} big />
      {rest.length > 0 && <UpcomingList shows={rest} />}
    </div>
  )
}

function About() {
  const [tab, setTab] = useState('short')
  return (
    <section className="space-y-4">
      <h2 className="text-xs uppercase tracking-widest text-neutral-400">About</h2>
      <div className="flex gap-6 border-b border-neutral-200">
        {[
          ['short', 'Short Bio'],
          ['long', 'Long Bio'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-2 text-sm uppercase tracking-wide -mb-px border-b-2 ${
              tab === key ? 'border-black font-bold' : 'border-transparent text-neutral-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'short' && <p className="leading-relaxed">{shortBio}</p>}
      {tab === 'long' && (
        <div className="space-y-3">
          {longBio.map((p, i) => (
            <p key={i} className="leading-relaxed">{p}</p>
          ))}
        </div>
      )}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pt-2">
          {photos.map((p) => (
            <img
              key={p.src}
              src={p.src}
              alt={p.alt}
              className="w-full aspect-square object-cover border border-black"
              loading="lazy"
            />
          ))}
        </div>
      )}
      <p className="text-sm pt-2">
        Follow us on Instagram:{' '}
        <a
          href={instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="underline font-medium"
        >
          {instagramHandle}
        </a>
      </p>
    </section>
  )
}

function Video() {
  return (
    <section className="space-y-3">
      <h2 className="text-xs uppercase tracking-widest text-neutral-400">Live Video</h2>
      {videos.map((id) => (
        <div key={id} className="aspect-video">
          <iframe
            className="w-full h-full border border-black"
            src={`https://www.youtube.com/embed/${id}`}
            title={id}
            allowFullScreen
          />
        </div>
      ))}
    </section>
  )
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function pad(n) {
  return String(n).padStart(2, '0')
}

function Calendar() {
  const today = useMemo(() => new Date(), [])
  const todayIso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

  // Default to the month of the next show, or current month.
  const firstEvent = events.find((e) => e.date >= todayIso) ?? events[0]
  const initial = firstEvent
    ? { year: Number(firstEvent.date.slice(0, 4)), month: Number(firstEvent.date.slice(5, 7)) - 1 }
    : { year: today.getFullYear(), month: today.getMonth() }

  const [view, setView] = useState(initial)
  const [selected, setSelected] = useState(firstEvent?.date ?? null)

  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
  const startWeekday = new Date(view.year, view.month, 1).getDay()
  const daysIn = new Date(view.year, view.month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysIn; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const eventDates = new Set(events.map((e) => e.date))
  const selectedEvent = selected ? events.find((e) => e.date === selected) : null

  const changeMonth = (delta) => {
    const m = view.month + delta
    if (m < 0) setView({ year: view.year - 1, month: 11 })
    else if (m > 11) setView({ year: view.year + 1, month: 0 })
    else setView({ year: view.year, month: m })
  }

  return (
    <section className="space-y-5">
      <h2 className="text-xs uppercase tracking-widest text-neutral-400">Calendar</h2>

      <div className="grid gap-5 lg:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start">
        {/* Calendar grid */}
        <div className="space-y-2">
          <div className="border-2 border-black">
            <div className="flex items-center justify-between border-b border-black px-3 py-2">
              <button
                onClick={() => changeMonth(-1)}
                className="px-2 py-1 text-lg leading-none hover:bg-black hover:text-white"
                aria-label="Previous month"
              >
                ‹
              </button>
              <span className="text-sm sm:text-base font-bold uppercase tracking-wide">{monthLabel}</span>
              <button
                onClick={() => changeMonth(1)}
                className="px-2 py-1 text-lg leading-none hover:bg-black hover:text-white"
                aria-label="Next month"
              >
                ›
              </button>
            </div>

            <div className="grid grid-cols-7 text-center text-[10px] sm:text-xs uppercase tracking-wider border-b border-neutral-200">
              {DAY_LABELS.map((d, i) => (
                <div key={i} className="py-1 text-neutral-500">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {cells.map((d, i) => {
                const cellSize = 'aspect-square sm:aspect-auto sm:h-12'
                if (d === null)
                  return (
                    <div
                      key={i}
                      className={`${cellSize} border-t border-r border-neutral-100 last:border-r-0`}
                    />
                  )
                const iso = `${view.year}-${pad(view.month + 1)}-${pad(d)}`
                const hasEvent = eventDates.has(iso)
                const isSelected = selected === iso
                const isToday = iso === todayIso
                return (
                  <button
                    key={i}
                    onClick={() => hasEvent && setSelected(iso)}
                    disabled={!hasEvent}
                    className={`${cellSize} border-t border-r border-neutral-100 text-xs sm:text-sm flex flex-col items-center justify-center gap-0.5 transition-colors
                      ${hasEvent ? 'cursor-pointer hover:bg-neutral-100' : 'text-neutral-300 cursor-default'}
                      ${isSelected ? 'bg-black text-white hover:bg-black' : ''}
                      ${isToday && !isSelected ? 'font-bold' : ''}
                    `}
                  >
                    <span>{d}</span>
                    {hasEvent && (
                      <span
                        className={`block w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-black'}`}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <p className="text-xs text-neutral-500 text-center">
            {eventDates.size === 0
              ? 'No upcoming shows.'
              : 'Dates with a dot have a show — tap to view details.'}
          </p>
        </div>

        {/* Selected event details */}
        <div className="lg:sticky lg:top-24">
          {selectedEvent ? (
            <ShowFlier event={selectedEvent} />
          ) : (
            <div className="border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
              Select a date with a show to see details.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function Stage() {
  const [infoOpen, setInfoOpen] = useState(false)
  return (
    <section className="space-y-6">
      <h2 className="text-xs uppercase tracking-widest text-neutral-400">Stage Plot</h2>

      <div className="border-2 border-black p-2 sm:p-3">
        <div className="grid grid-cols-6 grid-rows-2 gap-1.5 sm:gap-2 min-h-[180px] sm:min-h-[220px]">
          {stagePlot.map((item) => (
            <div
              key={item.label}
              className="border border-black p-1.5 sm:p-2 flex flex-col justify-center text-center leading-tight"
              style={{ gridColumn: item.gridColumn, gridRow: item.gridRow }}
            >
              <strong className="text-xs sm:text-sm break-words">{item.label}</strong>
              <span className="text-[10px] sm:text-xs text-neutral-500 break-words">{item.sub}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 border border-dashed border-black text-center py-1 text-[10px] sm:text-xs uppercase tracking-widest">
          Audience / Front of Stage
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-xs uppercase tracking-widest text-neutral-400">Input List</h3>
          <span className="text-xs uppercase tracking-widest text-neutral-400">(Suggested)</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setInfoOpen((o) => !o)}
              onMouseEnter={() => setInfoOpen(true)}
              onMouseLeave={() => setInfoOpen(false)}
              aria-label="More info about the input list"
              aria-expanded={infoOpen}
              className="w-4 h-4 rounded-full border border-neutral-400 text-[10px] font-bold leading-none text-neutral-500 flex items-center justify-center hover:border-black hover:text-black"
            >
              i
            </button>
            {infoOpen && (
              <div
                role="tooltip"
                className="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 top-full mt-2 z-20 bg-black text-white text-xs px-3 py-2 w-56 sm:w-64 normal-case tracking-normal"
              >
                We really don’t give a shit, we’re flexible.
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-black text-left">
                <th className="py-1 w-8 sm:w-12">Ch</th>
                <th className="py-1">Source</th>
                <th className="py-1">Mic / DI</th>
              </tr>
            </thead>
            <tbody>
              {inputList.map((row) => (
                <tr key={row.ch} className="border-b border-neutral-200">
                  <td className="py-1 text-neutral-500">{row.ch}</td>
                  <td className="py-1">{row.source}</td>
                  <td className="py-1">{row.mic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function Booking() {
  const [copied, setCopied] = useState(false)

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API blocked — fall back to a prompt so the user can copy manually
      window.prompt('Copy our email:', email)
    }
  }

  return (
    <section className="space-y-6">
      <h2 className="text-xs uppercase tracking-widest text-neutral-400">Booking</h2>

      <p className="text-base sm:text-lg leading-relaxed">
        Want to book {name}? Reach out directly — we read every inquiry
        and do our best to respond within a few days.
      </p>

      <button
        type="button"
        onClick={copyEmail}
        className="inline-flex items-center gap-2 border-2 border-black px-5 sm:px-6 py-3 font-bold tracking-wide text-sm sm:text-base hover:bg-black hover:text-white transition-colors break-all"
      >
        <span>{email}</span>
        <span className="text-xs uppercase tracking-widest opacity-70">
          {copied ? 'Copied!' : 'Tap to copy'}
        </span>
      </button>

      <p className="text-sm">
        Or DM us on Instagram:{' '}
        <a
          href={instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="underline font-medium"
        >
          {instagramHandle}
        </a>
      </p>

      <div className="border-t border-neutral-200 pt-5 space-y-3">
        <h3 className="text-xs uppercase tracking-widest text-neutral-400">What to include</h3>
        <ul className="space-y-1.5 text-sm sm:text-base text-neutral-700 leading-relaxed list-disc pl-5">
          <li>Proposed date(s) and venue</li>
          <li>Set length</li>
          <li>Slot — headline, support, or festival</li>
          <li>Compensation / door split</li>
          <li>Anything else we should know</li>
        </ul>
      </div>

      <div className="border-t border-neutral-200 pt-5 space-y-2">
        <h3 className="text-xs uppercase tracking-widest text-neutral-400">EPK Quick Links</h3>
        <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
          Everything you need is already here — live videos, bio, photos, and our
          stage plot are linked in the menu above.
        </p>
      </div>
    </section>
  )
}

export default function App() {
  const [page, setPage] = useState(() => pageFor(window.location.pathname))
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onPop = () => setPage(pageFor(window.location.pathname))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    document.title = page === 'Home' ? `${name} — Official Site` : `${page} · ${name}`
  }, [page])

  const go = (p) => {
    const path = pathFor(p)
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path)
    }
    setPage(p)
    setMenuOpen(false)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <header className="border-b-2 border-black sticky top-0 bg-white z-10">
        <nav className="relative px-6 py-4 flex items-center justify-between sm:justify-center">
          <button
            onClick={() => go('Home')}
            className="text-2xl sm:absolute sm:left-6"
            style={{ fontFamily: '"Faster One", system-ui' }}
          >
            {name}
          </button>

          <div className="hidden sm:flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
            {pages.map((p) => (
              <button
                key={p}
                onClick={() => go(p)}
                className={`text-sm uppercase tracking-wide hover:underline ${
                  page === p ? 'font-bold underline' : 'text-neutral-500'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="sm:hidden flex flex-col gap-1.5 p-1"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="block w-6 h-0.5 bg-black" />
            <span className="block w-6 h-0.5 bg-black" />
            <span className="block w-6 h-0.5 bg-black" />
          </button>
        </nav>

        {menuOpen && (
          <div className="sm:hidden border-t border-neutral-200 flex flex-col">
            {pages.map((p) => (
              <button
                key={p}
                onClick={() => go(p)}
                className={`px-6 py-3 text-left text-sm uppercase tracking-wide border-b border-neutral-100 ${
                  page === p ? 'font-bold' : 'text-neutral-500'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </header>

      <main
        className={`mx-auto px-4 sm:px-6 py-8 sm:py-12 ${
          page === 'Calendar' ? 'max-w-5xl' : 'max-w-2xl'
        }`}
      >
        {page === 'Home' && <Flier />}
        {page === 'About' && <About />}
        {page === 'Video' && <Video />}
        {page === 'Calendar' && <Calendar />}
        {page === 'Stage' && <Stage />}
        {page === 'Booking' && <Booking />}
      </main>
    </div>
  )
}
