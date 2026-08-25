import { useEffect, useMemo, useState, type Dispatch } from 'react'
import { isDraftDirty, type Action, type Level, type ShowcaseState } from '../mock/model'

interface ScreenProps {
  state: ShowcaseState
  dispatch: Dispatch<Action>
}

function diffKind(level: Level, publishedLevels: Level[]) {
  const published = publishedLevels.find((item) => item.id === level.id)
  if (level.deleted) return 'deleted'
  if (!published) return 'new'
  if (published.title !== level.title || published.criteria !== level.criteria || published.chapterId !== level.chapterId) return 'modified'
  return 'clean'
}

export function CourseDesignScreen({ state, dispatch }: ScreenProps) {
  const [selectedId, setSelectedId] = useState(state.draftLevels[0]?.id ?? '')
  const [now, setNow] = useState(Date.now())
  const dirty = isDraftDirty(state)
  const selected = state.draftLevels.find((level) => level.id === selectedId) ?? state.draftLevels[0]
  const selectedChapter = state.draftChapters.find((chapter) => chapter.id === selected?.chapterId)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (selectedId && state.draftLevels.some((level) => level.id === selectedId)) return
    setSelectedId(state.draftLevels[0]?.id ?? '')
  }, [selectedId, state.draftLevels])

  const changes = useMemo(() => {
    const rows: { kind: 'new' | 'modified' | 'deleted'; id: string; label: string }[] = []
    if (JSON.stringify(state.draftCourse) !== JSON.stringify(state.publishedCourse)) {
      rows.push({ kind: 'modified', id: 'META', label: '課程基本資訊' })
    }
    state.draftChapters.forEach((chapter) => {
      const published = state.publishedChapters.find((item) => item.id === chapter.id)
      if (!published) rows.push({ kind: 'new', id: chapter.code, label: chapter.name })
      else if (published.name !== chapter.name) rows.push({ kind: 'modified', id: chapter.code, label: chapter.name })
    })
    state.draftLevels.forEach((level) => {
      const kind = diffKind(level, state.publishedLevels)
      if (kind !== 'clean') rows.push({ kind, id: level.id, label: level.title })
    })
    return rows
  }, [state])

  return (
    <section className="cockpit-page design-page">
      <div className="ambient-grid" aria-hidden="true" />
      <div className="corner corner-tl" /><div className="corner corner-tr" />
      <div className="corner corner-bl" /><div className="corner corner-br" />

      <header className="system-strip system-strip-top">
        <div className="strip-group">
          <span className="live-indicator"><i /> COURSE DESIGN</span>
          <strong>{state.draftCourse.title}</strong>
        </div>
        <div className="strip-group">
          <span className={dirty ? 'draft-state dirty' : 'draft-state'}>{dirty ? '● DRAFT' : '● IN SYNC'}</span>
          <time>{new Date(now).toLocaleTimeString('zh-TW', { hour12: false })}</time>
        </div>
      </header>

      <div className="design-layout">
        <section className="design-editor">
          <div className="course-fields">
            <label>
              <span>COURSE TITLE</span>
              <input value={state.draftCourse.title} onChange={(event) => dispatch({ type: 'EDIT_COURSE', field: 'title', value: event.target.value })} />
            </label>
            <label>
              <span>DESCRIPTION · OPTIONAL</span>
              <textarea value={state.draftCourse.description} onChange={(event) => dispatch({ type: 'EDIT_COURSE', field: 'description', value: event.target.value })} />
            </label>
          </div>

          <div className="editor-toolbar">
            <div>
              <span>[ COURSE STRUCTURE ]</span>
              <strong>{state.draftChapters.filter((chapter) => !chapter.deleted).length} CH · {state.draftLevels.filter((level) => !level.deleted).length} LV</strong>
            </div>
            <button type="button" onClick={() => dispatch({ type: 'ADD_CHAPTER' })}>＋ 新增章節</button>
          </div>

          <div className="chapter-editor-list">
            {state.draftChapters.map((chapter) => {
              const chapterLevels = state.draftLevels.filter((level) => level.chapterId === chapter.id)
              return (
                <section className={`chapter-editor ${chapter.deleted ? 'is-deleted' : ''}`} key={chapter.id}>
                  <header>
                    <span>{chapter.code}</span>
                    <input
                      aria-label={`${chapter.code} 章節名稱`}
                      value={chapter.name}
                      onChange={(event) => dispatch({ type: 'EDIT_CHAPTER', chapterId: chapter.id, value: event.target.value })}
                    />
                    <small>{chapterLevels.filter((level) => !level.deleted).length} LEVELS</small>
                    <button type="button" onClick={() => dispatch({ type: 'ADD_LEVEL', chapterId: chapter.id })}>＋ LEVEL</button>
                  </header>
                  <div>
                    {chapterLevels.map((level) => {
                      const kind = diffKind(level, state.publishedLevels)
                      return (
                        <article
                          className={`level-editor-row ${kind} ${selected?.id === level.id ? 'is-selected' : ''}`}
                          key={level.id}
                          onClick={() => setSelectedId(level.id)}
                        >
                          <span className="editor-level-id">{level.id}</span>
                          <div className="editor-level-copy">
                            <input
                              aria-label={`${level.id} 關卡標題`}
                              value={level.title}
                              onClick={(event) => event.stopPropagation()}
                              onChange={(event) => dispatch({ type: 'EDIT_LEVEL', levelId: level.id, field: 'title', value: event.target.value })}
                            />
                            <input
                              aria-label={`${level.id} 達成條件`}
                              value={level.criteria}
                              onClick={(event) => event.stopPropagation()}
                              onChange={(event) => dispatch({ type: 'EDIT_LEVEL', levelId: level.id, field: 'criteria', value: event.target.value })}
                            />
                          </div>
                          <span className={`change-tag ${kind}`}>{kind === 'clean' ? '●' : kind === 'new' ? 'NEW' : kind === 'modified' ? 'MOD' : 'DEL'}</span>
                          <div className="editor-row-actions">
                            <button type="button" title="上移" onClick={(event) => { event.stopPropagation(); dispatch({ type: 'MOVE_LEVEL', levelId: level.id, direction: -1 }) }}>↑</button>
                            <button type="button" title="下移" onClick={(event) => { event.stopPropagation(); dispatch({ type: 'MOVE_LEVEL', levelId: level.id, direction: 1 }) }}>↓</button>
                            <button type="button" title="複製" onClick={(event) => { event.stopPropagation(); dispatch({ type: 'DUPLICATE_LEVEL', levelId: level.id }) }}>⧉</button>
                            <button type="button" title={level.deleted ? '還原' : '軟刪除'} onClick={(event) => { event.stopPropagation(); dispatch({ type: 'TOGGLE_DELETE_LEVEL', levelId: level.id }) }}>{level.deleted ? '↺' : '×'}</button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        </section>

        <aside className="design-preview">
          <div className="panel-label">[ PREVIEW · STUDENT ]</div>
          <div className="preview-meta">
            <span>{selected?.id} · {selectedChapter?.code}</span>
            <span>LIVE DRAFT</span>
          </div>
          <div className="preview-number">{selected?.id.replace('L', '').padStart(2, '0')}</div>
          <p className="eyebrow">{selectedChapter?.code} · {selectedChapter?.name}</p>
          <h1>{selected?.title}</h1>
          <div className="criteria-block">
            <span className="section-kicker">— 達成條件</span>
            <p>{selected?.criteria}</p>
          </div>
          <div className="preview-state"><i /> 進行中</div>
          <button type="button" className="primary-action">▶ 我完成了</button>
          <button type="button" className="warning-action">⚠ 我卡住了</button>
        </aside>
      </div>

      <aside className={`publish-dock ${dirty ? 'is-dirty' : ''}`}>
        <header>
          <span><i /> {dirty ? `UNPUBLISHED · ${changes.length}` : 'IN SYNC'}</span>
          <small>DIFF · {new Date(now).toLocaleTimeString('zh-TW', { hour12: false })}</small>
        </header>
        <div className="diff-list">
          {changes.length === 0 && <p>✓ 學員 / Public 已同步</p>}
          {changes.slice(0, 4).map((change) => (
            <p key={`${change.kind}-${change.id}`} className={change.kind}>
              <span>{change.kind === 'new' ? '+' : change.kind === 'deleted' ? '−' : '~'} {change.id}</span>
              <em>{change.label}</em>
              <strong>{change.kind.slice(0, 3).toUpperCase()}</strong>
            </p>
          ))}
          {changes.length > 4 && <p className="more-diff">…還有 {changes.length - 4} 項</p>}
        </div>
        <div className="publish-actions">
          <button type="button" disabled={!dirty} onClick={() => dispatch({ type: 'PUBLISH' })}>▶ 發布</button>
          <button type="button" disabled={!dirty} onClick={() => dispatch({ type: 'REVERT' })}>⤺ 還原</button>
        </div>
      </aside>

      <footer className="system-strip system-strip-bottom">
        <span>MODE · BUILDER</span>
        <span>{state.draftLevels.filter((level) => !level.deleted).length} LV · {state.draftChapters.length} CH{dirty ? ` · ${changes.length} UNPUB` : ''}</span>
        <span className={dirty ? 'draft-state dirty' : 'connection'}>{dirty ? 'DRAFT ◉' : 'PUBLISHED · IN SYNC ◉'}</span>
      </footer>
    </section>
  )
}
