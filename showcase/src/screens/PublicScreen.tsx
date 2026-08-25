import { useEffect, useMemo, useState } from 'react'
import { activeChapters, activeLevels, completedCount, stuckCount, type ShowcaseState } from '../mock/model'

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function duration(milliseconds: number, secondsOnly = false) {
  const total = Math.max(0, Math.floor(milliseconds / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return secondsOnly ? `${pad(Math.floor(total / 60))}:${pad(seconds)}` : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export function PublicScreen({ state }: { state: ShowcaseState }) {
  const [now, setNow] = useState(Date.now())
  const levels = activeLevels(state.publishedLevels)
  const chapters = activeChapters(state.publishedChapters)
  const focus = levels.find((level) => level.id === state.focusLevelId) ?? levels[0]
  const focusChapter = chapters.find((chapter) => chapter.id === focus?.chapterId)
  const done = completedCount(state, focus.id)
  const stuck = stuckCount(state, focus.id)
  const total = state.students.length
  const remaining = Math.max(0, state.expectedEndsAt - now)
  const focusDonePercent = total ? Math.round(done / total * 100) : 0
  const focusStuckPercent = total ? Math.round(stuck / total * 100) : 0

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const groups = useMemo(() => [...chapters].reverse().map((chapter) => ({
    chapter,
    levels: levels.filter((level) => level.chapterId === chapter.id),
  })).filter((group) => group.levels.length > 0), [chapters, levels])

  const overallDone = levels.reduce((sum, level) => sum + completedCount(state, level.id), 0)
  const overallPercent = levels.length && total ? Math.round(overallDone / (levels.length * total) * 100) : 0
  const clock = new Date(now).toLocaleTimeString('zh-TW', { hour12: false })

  return (
    <section className="cockpit-page public-page">
      <div className="ambient-grid" aria-hidden="true" />
      <div className="scan-line" aria-hidden="true" />
      <div className="corner corner-tl" /><div className="corner corner-tr" />
      <div className="corner corner-bl" /><div className="corner corner-br" />

      <header className="public-top-strip">
        <div><span className="recording"><i /> REC</span><span>◉ STATION · {state.room}</span><span>|</span><strong>{state.publishedCourse.title}</strong></div>
        <div><span>{new Date(now).toLocaleDateString('sv-SE')}</span><time>{clock}</time><span>● LIVE</span></div>
      </header>

      <div className="public-grid">
        <section className="panel public-focus">
          <div className="panel-label">[ FOCUS · NOW ]</div>
          <p className="eyebrow">{focusChapter?.code} · {focusChapter?.name}</p>
          <p className="focus-level-label">LEVEL {pad(levels.indexOf(focus) + 1)} / {pad(levels.length)}</p>
          <h1>{focus.title}</h1>
          <div className="criteria-block">
            <span className="section-kicker">— 達成條件</span>
            <p>{focus.criteria}</p>
          </div>
          <div className="public-progress-stack">
            <div className="public-progress stuck-progress">
              <header><span>▲ STUCK</span><strong>{stuck} / {total}</strong></header>
              <div><i style={{ width: `${focusStuckPercent}%` }} /></div>
            </div>
            <div className="public-progress done-progress">
              <header><span>✓ DONE</span><strong>{done} / {total}</strong></header>
              <div><i style={{ width: `${focusDonePercent}%` }} /><b>{done} / {total}</b></div>
            </div>
            <footer><span>ELAPSED <strong>{duration(now - state.startedAt).slice(0, 5)}</strong></span><span>STUDENTS <strong>{total}</strong></span></footer>
          </div>
        </section>

        <section className="panel timer-panel">
          <div className="panel-label">[ T-REMAIN ]</div>
          <p>REMAINING TO BREAK</p>
          <div className="timer-value">
            {duration(remaining, true).split(':')[0]}<span>:</span><strong>{duration(remaining, true).split(':')[1]}</strong>
          </div>
          <div className="timer-units"><span>MM</span><span>SS</span></div>
          <footer><span>ELAPSED <strong>{duration(now - state.startedAt).slice(0, 5)}</strong></span><span className={remaining > 0 ? 'connection' : 'danger-text'}>● {remaining > 0 ? 'ON SCHEDULE' : 'OVERDUE'}</span></footer>
        </section>

        <section className="panel public-levels">
          <div className="panel-label">[ ALL LEVELS · {pad(levels.length)} ]</div>
          <header className="public-level-columns"><span>LV</span><span>NAME</span><span>PROGRESS</span><span>DONE</span><span>STUCK</span></header>
          <div className="public-level-scroll">
            {groups.map(({ chapter, levels: chapterLevels }) => (
              <div key={chapter.id}>
                <div className="public-chapter-row"><strong>{chapter.code}</strong><span>{chapter.name.toLowerCase().replace(/\s+/g, '-')}</span><small>{chapterLevels.length} LV</small></div>
                {chapterLevels.map((level) => {
                  const levelDone = completedCount(state, level.id)
                  const levelStuck = stuckCount(state, level.id)
                  const percent = total ? Math.round(levelDone / total * 100) : 0
                  const isFocus = level.id === focus.id
                  return (
                    <div className={`public-level-row ${isFocus ? 'is-focus' : ''} ${percent === 100 ? 'is-complete' : ''}`} key={level.id}>
                      <span>{level.id}</span>
                      <strong>{level.title}{isFocus && <em> ◀ NOW</em>}</strong>
                      <div className="public-bar"><i style={{ width: `${percent}%` }} /><span>{levelDone}/{total}</span></div>
                      <b>{percent === 100 ? '✓' : levelDone}<small>/{total}</small></b>
                      <mark className={levelStuck ? 'has-stuck' : ''}>{levelStuck ? `⚠ ${levelStuck}` : '—'}</mark>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="public-bottom-strip">
        <span>SYS · NOMINAL</span>
        <span>COMPLETION <strong>{overallPercent}%</strong></span>
        <span>UPTIME <strong>{duration(now - state.startedAt)}</strong></span>
        <span>CREW <b>{total}</b> ONLINE</span>
      </footer>
    </section>
  )
}
