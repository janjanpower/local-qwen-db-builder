import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Database,
  GitBranch,
  LayoutGrid,
  Map,
  MonitorCheck,
  Server,
  Sparkles,
} from "lucide-react";

const roadmap = [
  { title: "企畫與架構設計", status: "完成", progress: 85 },
  { title: "靜態文件網站", status: "進行中", progress: 70 },
  { title: "React 25x25 畫布", status: "規劃中", progress: 10 },
  { title: "Tool Registry 工具系統", status: "規劃中", progress: 0 },
  { title: "IndexedDB 本地資料層", status: "規劃中", progress: 0 },
  { title: "AI Schema Proposal", status: "規劃中", progress: 0 },
];

const modules = [
  {
    icon: LayoutGrid,
    title: "Canvas Grid Engine",
    description: "以 25x25 格線作為平台底層，所有工具以格數定義位置、大小與擺放型態。",
  },
  {
    icon: ClipboardList,
    title: "Tool Registry",
    description: "工具不直接寫死在頁面，而是用 Manifest 描述尺寸、資料需求、支援操作與 UI 元件。",
  },
  {
    icon: Database,
    title: "Local Data Layer",
    description: "靜態網頁第一階段使用 IndexedDB 儲存畫布、工具設定、資料集合與 mapping。",
  },
  {
    icon: Sparkles,
    title: "AI Schema Proposal",
    description: "AI 只產生資料庫建議與欄位 mapping，不直接修改資料庫，需經使用者確認後套用。",
  },
];

const decisions = [
  "第一版以靜態網站部署到 GitHub Pages。",
  "資料層先用 IndexedDB，未來再評估 SQLite WASM。",
  "離線 AI 初期不強制內建 Gemma，可先用規則引擎跑通流程。",
  "AI 不直接執行 SQL，只產生 Schema Proposal。",
  "會員登入與工具市場延後，先完成畫布、工具與資料流。",
];

function ProgressBar({ value }) {
  return (
    <div className="progress-track">
      <span style={{ width: `${value}%` }} />
    </div>
  );
}

function Section({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="doc-section">
      <div className="section-heading">
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function App() {
  return (
    <main className="site-shell">
      <aside className="side-nav">
        <div className="brand-block">
          <div className="brand-mark">LQ</div>
          <div>
            <strong>Local Qwen</strong>
            <span>Project Docs</span>
          </div>
        </div>
        <nav>
          <a href="#overview"><MonitorCheck size={17} />總覽</a>
          <a href="#proposal"><BookOpen size={17} />企畫書</a>
          <a href="#spec"><Server size={17} />規格書</a>
          <a href="#roadmap"><Map size={17} />進度</a>
          <a href="#decisions"><GitBranch size={17} />決策</a>
        </nav>
      </aside>

      <div className="page-content">
        <header id="overview" className="hero">
          <div className="hero-copy">
            <span>Project Planning Document</span>
            <h1>Local AI Canvas Platform</h1>
            <p>
              一個本地優先、AI 協助建立資料結構、以格線畫布承載工具的個人應用平台。
              本頁是專案企畫書、系統規格書與開發進度監測頁。
            </p>
          </div>
          <div className="hero-panel">
            <span>目前階段</span>
            <strong>靜態文件站</strong>
            <p>GitHub Pages 已可部署，下一步是收斂畫布與工具系統規格。</p>
          </div>
        </header>

        <Section id="proposal" eyebrow="01 / Proposal" title="平台企畫書">
          <div className="two-column">
            <article className="doc-card">
              <h3>專案定位</h3>
              <p>
                本平台定位為本地資料庫、離線 AI 與格線畫布工具系統的整合平台。
                使用者透過對話描述需求，系統協助產生資料結構與可放置在畫布上的工具。
              </p>
            </article>
            <article className="doc-card">
              <h3>產品願景</h3>
              <p>
                讓非工程背景使用者也能建立自己的小型管理系統，例如客戶管理、預約管理、
                任務追蹤、庫存紀錄、個人知識庫與小型 CRM。
              </p>
            </article>
          </div>

          <div className="value-grid">
            <div><strong>本地優先</strong><span>資料保留在使用者本地端。</span></div>
            <div><strong>AI 協助建置</strong><span>自然語言轉成資料庫建議。</span></div>
            <div><strong>畫布式操作</strong><span>工具可用格線自由擺放。</span></div>
            <div><strong>工具擴充</strong><span>未來支援登入後新增工具。</span></div>
          </div>
        </Section>

        <Section id="spec" eyebrow="02 / Specification" title="系統規格書">
          <div className="module-grid">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <article className="module-card" key={module.title}>
                  <Icon size={24} />
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                </article>
              );
            })}
          </div>

          <div className="spec-table">
            <div><strong>前端</strong><span>React + Vite + 靜態部署</span></div>
            <div><strong>畫布</strong><span>25x25 格線，工具支援移動、縮放、橫放與直放</span></div>
            <div><strong>資料庫</strong><span>第一階段 IndexedDB，第二階段評估 SQLite WASM</span></div>
            <div><strong>AI</strong><span>Intent Parser、Schema Planner、Tool Matcher</span></div>
            <div><strong>部署</strong><span>GitHub Pages + GitHub Actions</span></div>
          </div>
        </Section>

        <Section id="roadmap" eyebrow="03 / Progress" title="開發進度監測">
          <div className="roadmap-list">
            {roadmap.map((item, index) => (
              <article className="roadmap-item" key={item.title}>
                <div className="roadmap-index">{String(index + 1).padStart(2, "0")}</div>
                <div>
                  <div className="roadmap-title">
                    <h3>{item.title}</h3>
                    <span>{item.status}</span>
                  </div>
                  <ProgressBar value={item.progress} />
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section id="decisions" eyebrow="04 / Decision Log" title="架構決策紀錄">
          <div className="decision-list">
            {decisions.map((decision) => (
              <div className="decision-item" key={decision}>
                <CheckCircle2 size={18} />
                <span>{decision}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </main>
  );
}
