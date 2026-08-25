import { useEffect, useReducer, useState } from 'react'
import { CourseDesignScreen } from './screens/CourseDesignScreen'
import { IntroScreen } from './screens/IntroScreen'
import { PublicScreen } from './screens/PublicScreen'
import { StudentScreen } from './screens/StudentScreen'
import {
  createInitialState,
  showcaseReducer,
  type ScenarioId,
  type ViewId,
} from './mock/model'

const navViewIds = ['student', 'design', 'public'] as const

const viewLabels: Record<(typeof navViewIds)[number], { short: string; label: string; glyph: string }> = {
  student: { short: 'STUDENT', label: '學員端', glyph: '◎' },
  design: { short: 'DESIGN', label: '講師設計頁', glyph: '⌥' },
  public: { short: 'PUBLIC', label: 'Public 投影', glyph: '▣' },
}

function viewFromHash(): ViewId {
  const hash = window.location.hash.replace('#', '')
  return hash === 'student' || hash === 'design' || hash === 'public' ? hash : 'intro'
}

export function App() {
  const [state, dispatch] = useReducer(showcaseReducer, undefined, () => createInitialState())
  const [view, setView] = useState<ViewId>(viewFromHash)

  useEffect(() => {
    const onHashChange = () => setView(viewFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = (next: ViewId) => {
    window.location.hash = next
    setView(next)
  }

  const reset = (scenario: ScenarioId) => dispatch({ type: 'RESET', scenario })

  return (
    <div className="showcase-shell">
      <nav className="showcase-nav" aria-label="Showcase 畫面切換">
        <button
          type="button"
          className={`showcase-brand ${view === 'intro' ? 'is-active' : ''}`}
          aria-label="回到 Cairn Lab 專案簡介"
          aria-pressed={view === 'intro'}
          onClick={() => navigate('intro')}
        >
          <span className="showcase-brand-mark">CL</span>
          <span>PANEL</span>
        </button>

        {navViewIds.map((id) => {
          const item = viewLabels[id]
          return (
            <button
              type="button"
              key={id}
              className={`showcase-nav-item ${view === id ? 'is-active' : ''}`}
              onClick={() => navigate(id)}
              aria-pressed={view === id}
              title={item.label}
            >
              <span className="showcase-nav-glyph" aria-hidden="true">{item.glyph}</span>
              <span>{item.short}</span>
            </button>
          )
        })}

        <div className="showcase-tools">
          <label htmlFor="scenario-select">SCENARIO</label>
          <select
            id="scenario-select"
            value={state.scenario}
            onChange={(event) => reset(event.target.value as ScenarioId)}
          >
            <option value="live">課堂進行中</option>
            <option value="calm">進度順利</option>
            <option value="pressure">多人卡住</option>
          </select>
          <button type="button" className="reset-button" onClick={() => reset(state.scenario)}>
            ↺ RESET
          </button>
        </div>

        <div className="showcase-version">
          <span>DESIGN</span>
          <strong>v120</strong>
        </div>
      </nav>

      <main className="showcase-stage">
        {view === 'intro' && <IntroScreen state={state} navigate={navigate} />}
        {view === 'student' && <StudentScreen state={state} dispatch={dispatch} />}
        {view === 'design' && <CourseDesignScreen state={state} dispatch={dispatch} />}
        {view === 'public' && <PublicScreen state={state} />}
      </main>
    </div>
  )
}
