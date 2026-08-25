import { useEffect, useMemo, useState, type Dispatch } from 'react'
import {
  activeChapters,
  activeLevels,
  type Action,
  type Level,
  type ShowcaseState,
} from '../mock/model'

interface ScreenProps {
  state: ShowcaseState
  dispatch: Dispatch<Action>
}

function useClock() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  return now
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function elapsedLabel(milliseconds: number, withHours = false) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = seconds % 60
  return withHours ? `${pad(hours)}:${pad(minutes)}:${pad(rest)}` : `${pad(Math.floor(seconds / 60))}:${pad(rest)}`
}

export function StudentScreen({ state, dispatch }: ScreenProps) {
  const now = useClock()
  const [modalLevel, setModalLevel] = useState<Level | null>(null)
  const [reason, setReason] = useState('')
  const levels = activeLevels(state.publishedLevels)
  const chapters = activeChapters(state.publishedChapters)
  const progress = state.progress[state.currentStudentId] ?? {}
  const focus = levels.find((level) => level.id === state.focusLevelId) ?? levels[0]
  const focusProgress = progress[focus?.id]
  const focusChapter = chapters.find((chapter) => chapter.id === focus?.chapterId)
  const doneCount = levels.filter((level) => progress[level.id]?.status === 'done').length

  const groups = useMemo(
    () => chapters.map((chapter) => ({
      chapter,
      levels: levels.filter((level) => level.chapterId === chapter.id),
    })).filter((group) => group.levels.length > 0),
    [chapters, levels],
  )

  const openStuck = (level: Level) => {
    setModalLevel(level)
    setReason(progress[level.id]?.reason ?? '')
  }

  const closeModal = () => {
    setModalLevel(null)
    setReason('')
  }

  const reportStuck = () => {
    if (!modalLevel) return
    dispatch({ type: 'REPORT_STUCK', levelId: modalLevel.id, reason: reason.trim() })
    dispatch({ type: 'FOCUS_LEVEL', levelId: modalLevel.id })
    closeModal()
  }

  return (
    <section className="cockpit-page student-page">
      <div className="ambient-grid" aria-hidden="true" />
      <div className="corner corner-tl" /><div className="corner corner-tr" />
      <div className="corner corner-bl" /><div className="corner corner-br" />

      <header className="system-strip system-strip-top">
        <div className="strip-group">
          <span className="live-indicator"><i /> LIVE</span>
          <strong>{state.publishedCourse.title}</strong>
          <span>· {state.room}</span>
        </div>
        <div className="strip-group">
          <label htmlFor="student-select">身份</label>
          <select
            id="student-select"
            value={state.currentStudentId}
            onChange={(event) => dispatch({ type: 'SELECT_STUDENT', studentId: event.target.value })}
          >
            {state.students.map((student) => (
              <option value={student.id} key={student.id}>{student.name}</option>
            ))}
          </select>
          <span className="separator">|</span>
          <time>{new Date(now).toLocaleTimeString('zh-TW', { hour12: false })}</time>
        </div>
      </header>

      <div className="student-grid">
        <section className="panel focus-panel">
          <div className="panel-label">[ FOCUS · NOW ]</div>
          <div className="panel-corner panel-corner-tr" />
          <div className="focus-heading">
            <div>
              <p className="eyebrow">{focusChapter?.code} · {focusChapter?.name}</p>
              <p className="focus-level-label">LEVEL {pad(levels.indexOf(focus) + 1)} / {pad(levels.length)}</p>
            </div>
            <span className="outline-number">{pad(levels.indexOf(focus) + 1)}</span>
          </div>
          <h1>{focus?.title}</h1>
          <div className="criteria-block">
            <span className="section-kicker">— 達成條件</span>
            <p>{focus?.criteria}</p>
          </div>
          <div className={`focus-status ${focusProgress?.status ?? 'active'}`}>
            <span><i />{focusProgress?.status === 'done' ? '已完成' : focusProgress?.status === 'stuck' ? '卡住 · TA 處理中' : '進行中'}</span>
            <strong>{elapsedLabel(now - state.startedAt)}</strong>
          </div>
          <div className="focus-actions">
            <button
              type="button"
              className={`primary-action ${focusProgress?.status === 'done' ? 'is-done' : ''}`}
              onClick={() => dispatch({ type: 'TOGGLE_DONE', levelId: focus.id })}
            >
              {focusProgress?.status === 'done' ? '↺ 取消完成' : '▶ 我完成了'}
            </button>
            <button type="button" className="warning-action" onClick={() => openStuck(focus)}>
              ⚠ {focusProgress?.status === 'stuck' ? '更新卡住說明' : '我卡住了'}
            </button>
          </div>
        </section>

        <section className="panel levels-panel">
          <div className="panel-label">[ MY LEVELS · {levels.length} ]</div>
          <div className="level-scroll">
            {groups.map(({ chapter, levels: chapterLevels }) => {
              const chapterDone = chapterLevels.filter((level) => progress[level.id]?.status === 'done').length
              return (
                <div className="chapter-group" key={chapter.id}>
                  <header className="chapter-heading">
                    <span>{chapter.code}</span>
                    <strong>{chapter.name}</strong>
                    <small>{chapterDone} / {chapterLevels.length}{chapterDone === chapterLevels.length ? ' ✓' : chapter.id === focusChapter?.id ? ' · 進行中' : ''}</small>
                  </header>
                  {chapterLevels.map((level) => {
                    const itemProgress = progress[level.id]
                    const isFocus = focus.id === level.id
                    return (
                      <div key={level.id}>
                        <div
                          role="button"
                          tabIndex={0}
                          className={`level-row ${itemProgress?.status ?? ''} ${isFocus ? 'is-focus' : ''}`}
                          onClick={() => dispatch({ type: 'FOCUS_LEVEL', levelId: level.id })}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              dispatch({ type: 'FOCUS_LEVEL', levelId: level.id })
                            }
                          }}
                        >
                          <span className="level-id">{level.id}</span>
                          <span className="level-copy">
                            <strong>{level.title}{isFocus && <em> ◀ NOW</em>}</strong>
                            <small>{level.criteria}</small>
                          </span>
                          <span className="level-status">
                            {itemProgress?.status === 'done' ? '✓ 已完成' : itemProgress?.status === 'stuck' ? '▲ 卡住' : isFocus ? 'NOW' : '進行中'}
                          </span>
                          {itemProgress?.status !== 'done' && (
                            <span className="mini-actions">
                              <button
                                type="button"
                                aria-label={`完成 ${level.title}`}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  dispatch({ type: 'TOGGLE_DONE', levelId: level.id })
                                }}
                              >✓ 完成</button>
                              <button
                                type="button"
                                className="mini-stuck"
                                aria-label={`回報 ${level.title} 卡住`}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  openStuck(level)
                                }}
                              >⚠</button>
                            </span>
                          )}
                        </div>
                        {itemProgress?.status === 'stuck' && (
                          <div className="stuck-log">
                            <div><span>SESSION · STUCK-{level.id}</span><strong>● 處理中 · TA MIKO</strong></div>
                            <p><span>＞ REASON</span><br />{itemProgress.reason}</p>
                            <div className="stuck-controls">
                              <span>＞_</span>
                              <input aria-label="回覆 TA" placeholder="輸入訊息回覆 TA…" />
                              <button type="button" onClick={() => openStuck(level)}>編輯</button>
                              <button type="button" onClick={() => dispatch({ type: 'CLEAR_STUCK', levelId: level.id })}>解除</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
          <aside className="track" aria-label={`已完成 ${doneCount} 關，共 ${levels.length} 關`}>
            <strong>{doneCount} / {levels.length}</strong>
            <div className="track-line">
              {levels.map((level) => {
                const itemProgress = progress[level.id]
                return <i key={level.id} className={`${itemProgress?.status ?? ''} ${focus.id === level.id ? 'focus' : ''}`} title={level.title} />
              })}
            </div>
            <span>END</span>
          </aside>
        </section>
      </div>

      <footer className="system-strip system-strip-bottom">
        <span>STATUS · NOMINAL</span>
        <span>UPTIME {elapsedLabel(now - state.startedAt, true)}</span>
        <span className="connection">CONNECTION · STABLE ◉</span>
      </footer>

      {modalLevel && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeModal}>
          <section className="stuck-modal" role="dialog" aria-modal="true" aria-labelledby="stuck-title" onMouseDown={(event) => event.stopPropagation()}>
            <span className="modal-kicker">[ REPORT STUCK · {modalLevel.id} ]</span>
            <h2 id="stuck-title">{modalLevel.title}</h2>
            <label htmlFor="stuck-reason">卡在哪 · 講師會看到</label>
            <textarea
              id="stuck-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="例如：npm install 一直 error / 不知道 useState 要放哪…"
              autoFocus
            />
            <div className="modal-actions">
              <button type="button" onClick={closeModal}>取消</button>
              <button type="button" className="submit-stuck" onClick={reportStuck}>回報</button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}
