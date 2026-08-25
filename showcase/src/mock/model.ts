export type ViewId = 'intro' | 'student' | 'design' | 'public'
export type ScenarioId = 'live' | 'calm' | 'pressure'

export interface Chapter {
  id: string
  code: string
  name: string
  deleted?: boolean
}

export interface Level {
  id: string
  chapterId: string
  title: string
  criteria: string
  deleted?: boolean
}

export interface Student {
  id: string
  name: string
}

export interface Progress {
  status: 'done' | 'stuck'
  reason?: string
}

export interface CourseCopy {
  title: string
  description: string
}

export interface ShowcaseState {
  scenario: ScenarioId
  room: string
  startedAt: number
  expectedEndsAt: number
  currentStudentId: string
  focusLevelId: string
  students: Student[]
  publishedCourse: CourseCopy
  draftCourse: CourseCopy
  publishedChapters: Chapter[]
  draftChapters: Chapter[]
  publishedLevels: Level[]
  draftLevels: Level[]
  progress: Record<string, Record<string, Progress>>
}

export type Action =
  | { type: 'SELECT_STUDENT'; studentId: string }
  | { type: 'FOCUS_LEVEL'; levelId: string }
  | { type: 'TOGGLE_DONE'; levelId: string }
  | { type: 'REPORT_STUCK'; levelId: string; reason: string }
  | { type: 'CLEAR_STUCK'; levelId: string }
  | { type: 'EDIT_COURSE'; field: keyof CourseCopy; value: string }
  | { type: 'EDIT_CHAPTER'; chapterId: string; value: string }
  | { type: 'ADD_CHAPTER' }
  | { type: 'ADD_LEVEL'; chapterId: string }
  | { type: 'EDIT_LEVEL'; levelId: string; field: 'title' | 'criteria'; value: string }
  | { type: 'DUPLICATE_LEVEL'; levelId: string }
  | { type: 'MOVE_LEVEL'; levelId: string; direction: -1 | 1 }
  | { type: 'TOGGLE_DELETE_LEVEL'; levelId: string }
  | { type: 'PUBLISH' }
  | { type: 'REVERT' }
  | { type: 'RESET'; scenario: ScenarioId }

const chapters: Chapter[] = [
  { id: 'ch1', code: 'CH.01', name: '環境設定' },
  { id: 'ch2', code: 'CH.02', name: 'JSX 與元件' },
  { id: 'ch3', code: 'CH.03', name: '表單實作' },
  { id: 'ch4', code: 'CH.04', name: '副作用 useEffect' },
]

const levels: Level[] = [
  { id: 'L01', chapterId: 'ch1', title: '安裝 Node.js', criteria: '終端機跑 node -v 看到版本號' },
  { id: 'L02', chapterId: 'ch1', title: '建立 React 專案', criteria: 'npm create vite，瀏覽器看到歡迎頁' },
  { id: 'L03', chapterId: 'ch1', title: '安裝 VSCode 插件', criteria: 'ES7+ / Prettier 各裝一個' },
  { id: 'L04', chapterId: 'ch1', title: '第一次 commit', criteria: 'git init & git commit -m "init"' },
  { id: 'L05', chapterId: 'ch2', title: '第一個 Component', criteria: '新增 Hello.jsx，import 進 App.jsx' },
  { id: 'L06', chapterId: 'ch2', title: 'Props 傳遞', criteria: '把 name 從 App 傳給 Hello 並顯示' },
  { id: 'L07', chapterId: 'ch3', title: '表單驗證 — email 格式', criteria: '輸入錯誤 email 時，下方出現紅字提示' },
  { id: 'L08', chapterId: 'ch3', title: '受控元件 onChange', criteria: 'input 綁 useState，輸入時上方即時鏡像顯示' },
  { id: 'L09', chapterId: 'ch3', title: '多欄位表單', criteria: '姓名 / email / 密碼三欄共用一個 state 物件' },
  { id: 'L10', chapterId: 'ch3', title: '送出表單 onSubmit', criteria: '按下送出，alert 印出所有欄位值' },
  { id: 'L11', chapterId: 'ch4', title: 'useEffect 第一次', criteria: '頁面載入時 console.log 一次 hello' },
  { id: 'L12', chapterId: 'ch4', title: '相依陣列', criteria: 'count 變化才觸發 effect' },
]

const studentNames = [
  '小明（你）', 'Alice', 'Bob', 'Carol', 'David', 'Eve', 'Frank', 'Grace',
  'Henry', 'Ivy', 'Jack', 'Kelly', 'Leo', 'Mia', 'Noah', 'Olivia',
]

const copy = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T

function seedProgress(scenario: ScenarioId, students: Student[]) {
  const result: ShowcaseState['progress'] = {}

  students.forEach((student, studentIndex) => {
    result[student.id] = {}

    if (studentIndex === 0) {
      levels.slice(0, 4).forEach((level) => {
        result[student.id][level.id] = { status: 'done' }
      })
      if (scenario !== 'calm') {
        result[student.id].L07 = {
          status: 'stuck',
          reason: 'regex 好像永遠不會觸發紅字，console.log 也沒印出來',
        }
      }
      return
    }

    levels.forEach((level, levelIndex) => {
      const score = ((studentIndex + 1) * 13 + (levelIndex + 1) * 7) % 10
      if (levelIndex < 4 || score < (scenario === 'calm' ? 6 : 4)) {
        result[student.id][level.id] = { status: 'done' }
      } else if (score <= (scenario === 'pressure' ? 6 : 4)) {
        const reasons = ['環境問題', '看不懂 error', '卡在 import', '語法錯誤', 'regex 沒觸發']
        result[student.id][level.id] = {
          status: 'stuck',
          reason: reasons[studentIndex % reasons.length],
        }
      }
    })
  })

  return result
}

export function createInitialState(scenario: ScenarioId = 'live'): ShowcaseState {
  const students = studentNames.map((name, index) => ({ id: `s${index + 1}`, name }))
  const course = {
    title: 'React Hooks 入門 — 從 0 到表單',
    description: '三週 workshop，讓沒寫過 React 的學員能獨立做出一個受控多欄位表單。',
  }

  return {
    scenario,
    room: 'A301',
    startedAt: Date.now() - 15 * 60 * 1000,
    expectedEndsAt: Date.now() + 83 * 60 * 1000,
    currentStudentId: 's1',
    focusLevelId: 'L08',
    students,
    publishedCourse: copy(course),
    draftCourse: copy(course),
    publishedChapters: copy(chapters),
    draftChapters: copy(chapters),
    publishedLevels: copy(levels),
    draftLevels: copy(levels),
    progress: seedProgress(scenario, students),
  }
}

function updateOwnProgress(
  state: ShowcaseState,
  levelId: string,
  progress?: Progress,
): ShowcaseState {
  const studentProgress = { ...state.progress[state.currentStudentId] }
  if (progress) studentProgress[levelId] = progress
  else delete studentProgress[levelId]

  return {
    ...state,
    progress: {
      ...state.progress,
      [state.currentStudentId]: studentProgress,
    },
  }
}

export function showcaseReducer(state: ShowcaseState, action: Action): ShowcaseState {
  switch (action.type) {
    case 'SELECT_STUDENT':
      return { ...state, currentStudentId: action.studentId }
    case 'FOCUS_LEVEL':
      return { ...state, focusLevelId: action.levelId }
    case 'TOGGLE_DONE': {
      const current = state.progress[state.currentStudentId]?.[action.levelId]
      return updateOwnProgress(
        state,
        action.levelId,
        current?.status === 'done' ? undefined : { status: 'done' },
      )
    }
    case 'REPORT_STUCK':
      return updateOwnProgress(state, action.levelId, {
        status: 'stuck',
        reason: action.reason || '（未填寫）',
      })
    case 'CLEAR_STUCK':
      return updateOwnProgress(state, action.levelId)
    case 'EDIT_COURSE':
      return {
        ...state,
        draftCourse: { ...state.draftCourse, [action.field]: action.value },
      }
    case 'EDIT_CHAPTER':
      return {
        ...state,
        draftChapters: state.draftChapters.map((chapter) =>
          chapter.id === action.chapterId ? { ...chapter, name: action.value } : chapter,
        ),
      }
    case 'ADD_CHAPTER': {
      const number = state.draftChapters.length + 1
      const chapter: Chapter = {
        id: `ch-${Date.now()}`,
        code: `CH.${String(number).padStart(2, '0')}`,
        name: '新章節',
      }
      return { ...state, draftChapters: [...state.draftChapters, chapter] }
    }
    case 'ADD_LEVEL': {
      const level: Level = {
        id: `L${String(state.draftLevels.length + 1).padStart(2, '0')}`,
        chapterId: action.chapterId,
        title: '新關卡',
        criteria: '點擊右側編輯達成條件',
      }
      const lastIndex = state.draftLevels.reduce(
        (found, item, index) => (item.chapterId === action.chapterId ? index : found),
        -1,
      )
      const next = [...state.draftLevels]
      next.splice(lastIndex + 1, 0, level)
      return { ...state, draftLevels: next }
    }
    case 'EDIT_LEVEL':
      return {
        ...state,
        draftLevels: state.draftLevels.map((level) =>
          level.id === action.levelId ? { ...level, [action.field]: action.value } : level,
        ),
      }
    case 'DUPLICATE_LEVEL': {
      const index = state.draftLevels.findIndex((level) => level.id === action.levelId)
      if (index < 0) return state
      const source = state.draftLevels[index]
      const duplicate: Level = {
        ...copy(source),
        id: `L${String(state.draftLevels.length + 1).padStart(2, '0')}`,
        title: `${source.title} （複製）`,
        deleted: false,
      }
      const next = [...state.draftLevels]
      next.splice(index + 1, 0, duplicate)
      return { ...state, draftLevels: next }
    }
    case 'MOVE_LEVEL': {
      const from = state.draftLevels.findIndex((level) => level.id === action.levelId)
      if (from < 0) return state
      const source = state.draftLevels[from]
      const chapterIndexes = state.draftLevels
        .map((level, index) => ({ level, index }))
        .filter(({ level }) => level.chapterId === source.chapterId)
        .map(({ index }) => index)
      const chapterPosition = chapterIndexes.indexOf(from)
      const to = chapterIndexes[chapterPosition + action.direction]
      if (to === undefined) return state
      const next = [...state.draftLevels]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return { ...state, draftLevels: next }
    }
    case 'TOGGLE_DELETE_LEVEL':
      return {
        ...state,
        draftLevels: state.draftLevels.map((level) =>
          level.id === action.levelId ? { ...level, deleted: !level.deleted } : level,
        ),
      }
    case 'PUBLISH': {
      const cleanChapters = state.draftChapters.filter((chapter) => !chapter.deleted)
      const cleanLevels = state.draftLevels
        .filter((level) => !level.deleted)
        .map(({ deleted: _deleted, ...level }) => level)
      return {
        ...state,
        publishedCourse: copy(state.draftCourse),
        publishedChapters: copy(cleanChapters),
        publishedLevels: copy(cleanLevels),
        draftChapters: copy(cleanChapters),
        draftLevels: copy(cleanLevels),
      }
    }
    case 'REVERT':
      return {
        ...state,
        draftCourse: copy(state.publishedCourse),
        draftChapters: copy(state.publishedChapters),
        draftLevels: copy(state.publishedLevels),
      }
    case 'RESET':
      return createInitialState(action.scenario)
    default:
      return state
  }
}

export function isDraftDirty(state: ShowcaseState) {
  return (
    JSON.stringify(state.draftCourse) !== JSON.stringify(state.publishedCourse) ||
    JSON.stringify(state.draftChapters) !== JSON.stringify(state.publishedChapters) ||
    JSON.stringify(state.draftLevels) !== JSON.stringify(state.publishedLevels)
  )
}

export function activeLevels(levelsToFilter: Level[]) {
  return levelsToFilter.filter((level) => !level.deleted)
}

export function activeChapters(chaptersToFilter: Chapter[]) {
  return chaptersToFilter.filter((chapter) => !chapter.deleted)
}

export function completedCount(state: ShowcaseState, levelId: string) {
  return state.students.filter(
    (student) => state.progress[student.id]?.[levelId]?.status === 'done',
  ).length
}

export function stuckCount(state: ShowcaseState, levelId: string) {
  return state.students.filter(
    (student) => state.progress[student.id]?.[levelId]?.status === 'stuck',
  ).length
}
