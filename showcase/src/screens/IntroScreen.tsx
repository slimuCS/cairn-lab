import { activeLevels, completedCount, stuckCount, type ShowcaseState, type ViewId } from '../mock/model'

interface IntroScreenProps {
  state: ShowcaseState
  navigate: (view: ViewId) => void
}

export function IntroScreen({ state, navigate }: IntroScreenProps) {
  const levels = activeLevels(state.publishedLevels)
  const completed = levels.reduce((total, level) => total + completedCount(state, level.id), 0)
  const stuck = levels.reduce((total, level) => total + stuckCount(state, level.id), 0)
  const possible = levels.length * state.students.length
  const completion = possible ? Math.round(completed / possible * 100) : 0

  return (
    <section className="cockpit-page intro-page">
      <div className="ambient-grid" aria-hidden="true" />
      <div className="corner corner-tl" /><div className="corner corner-tr" />
      <div className="corner corner-bl" /><div className="corner corner-br" />

      <header className="intro-strip">
        <span>[ CAIRN LAB · PROJECT 001 ]</span>
        <span>WORKSHOP PROGRESS BOARD</span>
        <span className="connection">● SYSTEM READY</span>
      </header>

      <div className="intro-hero">
        <div className="intro-copy">
          <p className="intro-kicker">CAIRN LAB · 教學 PANEL</p>
          <h1>讓每個卡住的人，<br /><strong>都能被看見。</strong></h1>
          <p className="intro-lead">
            給實作課程的即時進度與求援看板。學員回報完成或卡住，
            TA 接手處理，講師在同一個畫面掌握全班節奏。
          </p>
          <div className="intro-actions">
            <button type="button" onClick={() => navigate('student')}>▶ 進入互動展示</button>
            <button type="button" onClick={() => navigate('public')}>PUBLIC 投影畫面 ↗</button>
          </div>
        </div>

        <div className="cairn-hero-visual" aria-label="Cairn 路標石堆，代表幫助課堂找到下一步">
          <div className="cairn-radar"><i /><i /><i /></div>
          <div className="cairn-stack" aria-hidden="true">
            <span /><span /><span /><span /><span />
          </div>
          <p>ONE SIGNAL<br /><strong>NEXT STEP</strong></p>
          <div className="cairn-coordinate">25.03°N · 121.56°E</div>
        </div>
      </div>

      <section className="intro-pulse-section" aria-labelledby="pulse-title">
        <header className="intro-section-heading">
          <div>
            <span>[ LIVE CLASSROOM PULSE ]</span>
            <h2 id="pulse-title">不用等到課後，現在就知道課堂發生什麼事。</h2>
          </div>
          <p>這些數字直接來自目前 showcase 的假資料，操作 Student 畫面後會一起變動。</p>
        </header>

        <div className="pulse-dashboard">
          <article className="pulse-focus-card">
            <div><span>目前關卡</span><strong>{state.focusLevelId}</strong></div>
            <h3>{levels.find((level) => level.id === state.focusLevelId)?.title}</h3>
            <div className="pulse-bars">
              <label><span>CLASS COMPLETION</span><strong>{completion}%</strong></label>
              <div><i style={{ width: `${completion}%` }} /></div>
              <label className="pulse-stuck-label"><span>ACTIVE STUCK SIGNALS</span><strong>{stuck}</strong></label>
              <div className="pulse-danger-bar"><i style={{ width: `${Math.min(100, stuck * 6)}%` }} /></div>
            </div>
          </article>
          <div className="pulse-stat-grid">
            <article><span>STUDENTS</span><strong>{String(state.students.length).padStart(2, '0')}</strong><small>JOINED</small></article>
            <article><span>CHECKPOINTS</span><strong>{String(levels.length).padStart(2, '0')}</strong><small>PUBLISHED</small></article>
            <article className="danger-stat"><span>NEED HELP</span><strong>{String(stuck).padStart(2, '0')}</strong><small>ACTIVE SIGNALS</small></article>
            <article><span>SYNC MODE</span><strong>05</strong><small>SEC REFRESH</small></article>
          </div>
        </div>
      </section>

      <section className="intro-relation-section" aria-labelledby="relation-title">
        <header className="intro-section-heading compact">
          <div>
            <span>[ SCREEN RELATION MAP ]</span>
            <h2 id="relation-title">六個視角，組成一堂課。</h2>
          </div>
          <p>全部畫面都圍繞著同一堂課的關卡、進度、求援與倒數；每個角色只看見他當下需要的那一面。</p>
        </header>

        <div className="relation-map">
          <div className="relation-rail rail-vertical"><i /></div>
          <div className="relation-rail rail-diagonal-left"><i /></div>
          <div className="relation-rail rail-diagonal-right"><i /></div>

          <span className="relation-label label-publish">PUBLISH</span>
          <span className="relation-label label-progress">PROGRESS</span>
          <span className="relation-label label-claim">CLAIM / RESOLVE</span>
          <span className="relation-label label-control">CONTROL</span>
          <span className="relation-label label-aggregate">ANON. AGGREGATE</span>
          <span className="relation-label label-manage">MANAGE</span>

          <button type="button" className="relation-node relation-student is-live" onClick={() => navigate('student')}>
            <span><i /> LIVE MOCK</span><b>◎</b><small>STUDENT</small><h3>學員端</h3><p>看關卡，回報完成或卡住。</p><em>OPEN VIEW ↗</em>
          </button>
          <article className="relation-node relation-ta is-planned">
            <span><i /> PLANNED</span><b>⊞</b><small>TA</small><h3>TA 救援頁</h3><p>看求援池，認領、求救、解決。</p><em>PROBLEM QUEUE</em>
          </article>
          <button type="button" className="relation-node relation-design is-live" onClick={() => navigate('design')}>
            <span><i /> LIVE MOCK</span><b>⌘</b><small>COURSE DESIGN</small><h3>講師設計頁</h3><p>編輯 draft，發布完整關卡版本。</p><em>OPEN VIEW ↗</em>
          </button>
          <article className="relation-node relation-core">
            <span><i /> SHARED SOURCE</span><b>CL</b><small>LIVE COURSE STATE</small><h3>單一堂課</h3><p>STAGES · PROGRESS<br />HELP · TIMER</p><em>● SYNCING</em>
          </article>
          <article className="relation-node relation-instructor is-planned">
            <span><i /> PLANNED</span><b>⌥</b><small>INSTRUCTOR</small><h3>講師控制台</h3><p>看全班進度、求援與倒數。</p><em>CLASS CONTROL</em>
          </article>
          <button type="button" className="relation-node relation-public is-live" onClick={() => navigate('public')}>
            <span><i /> LIVE MOCK</span><b>▣</b><small>PUBLIC DISPLAY</small><h3>投影畫面</h3><p>只取匿名統計與課堂倒數。</p><em>OPEN VIEW ↗</em>
          </button>
          <article className="relation-node relation-admin is-planned">
            <span><i /> PLANNED</span><b>∷</b><small>ADMIN</small><h3>課程管理頁</h3><p>建立、複製、匯出與軟刪除課程。</p><em>COURSE OPERATIONS</em>
          </article>
        </div>

        <div className="relation-legend">
          <span><i className="legend-live" /> LIVE MOCK · 目前可點入操作</span>
          <span><i className="legend-planned" /> PLANNED · 已在 spec-v1，尚未放入 showcase</span>
        </div>
      </section>

      <section className="intro-value-section">
        <article><span>01 · VISIBILITY</span><h3>卡住，不再靜悄悄。</h3><p>不用靠舉手或講師猜測，需要幫助的人會進入清楚的待處理池。</p></article>
        <article><span>02 · COORDINATION</span><h3>救火，不再重複。</h3><p>TA 有認領、求救與解決狀態，每個問題都知道現在是誰在處理。</p></article>
        <article><span>03 · PACE</span><h3>進度，不再靠感覺。</h3><p>講師同時看見完成、卡住與倒數，用全班信號調整教學節奏。</p></article>
      </section>

      <footer className="intro-footer">
        <div><span>CAIRN LAB</span><strong>教學 PANEL · WORKSHOP PROGRESS BOARD</strong></div>
        <button type="button" onClick={() => navigate('student')}>開始瀏覽 SHOWCASE →</button>
      </footer>
    </section>
  )
}
