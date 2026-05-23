import {
  BookOpen,
  Brain,
  CheckCircle2,
  ClipboardList,
  Database,
  FilePlus2,
  FolderInput,
  GitBranch,
  Hammer,
  LayoutGrid,
  LogIn,
  Map,
  MessageSquareText,
  MonitorCheck,
  PackageCheck,
  PanelTop,
  Server,
  Sparkles,
} from "lucide-react";

const roadmap = [
  { title: "企畫與架構設計", status: "完成", progress: 90 },
  { title: "靜態文件網站", status: "進行中", progress: 78 },
  { title: "本機操作者介面", status: "原型完成", progress: 72 },
  { title: "React 滿版格線畫布", status: "進行中", progress: 66 },
  { title: "左側工具面板與收納動畫", status: "進行中", progress: 64 },
  { title: "Tool Registry 工具系統", status: "規格確認中", progress: 28 },
  { title: "IndexedDB 本地資料層", status: "規劃中", progress: 10 },
  { title: "AI Schema Proposal", status: "規格確認中", progress: 24 },
];

const modules = [
  {
    icon: LayoutGrid,
    title: "Canvas Grid Engine",
    description: "操作者介面目前採 40x24 滿版格線，視窗寬高、標題列、收合高度都以格子為最小單位。",
  },
  {
    icon: ClipboardList,
    title: "Tool Registry",
    description: "工具未來用 Manifest 描述尺寸、資料需求與 UI；已先定義新增工具自動放入畫布或收進左側面板的規則。",
  },
  {
    icon: Database,
    title: "Local Data Layer",
    description: "目前先用 localStorage 保存畫布位置；資料表、工具設定與 mapping 後續改由 IndexedDB 儲存。",
  },
  {
    icon: Sparkles,
    title: "AI Schema Proposal",
    description: "離線版先以 Gemma 判斷語意，只操作本地資料庫的查詢、新增、修改、刪除，並以確認卡片降低誤操作。",
  },
];

const decisions = [
  "第一版以靜態網站部署到 GitHub Pages。",
  "資料層先用 IndexedDB，未來再評估 SQLite WASM。",
  "本機 127.0.0.1 顯示操作者介面，GitHub Pages 顯示企畫書、規格書與進度文件。",
  "離線版先內建或預裝 Gemma，本階段不開放使用者自行接 GPT / Claude API key。",
  "離線版功能限制在本地資料庫查詢、新增、修改、刪除；會員工具擴充延後。",
  "AI 不寫死語意規則，未來由 Gemma 判斷意圖並產生待確認操作。",
  "離線 MVP 先保存本機操作紀錄，支援查看、追蹤與未來復原功能。",
  "操作者畫布改以 40x24 滿版格線驗證桌面版可用性，格子貼齊頁面邊緣。",
  "視窗必須對齊格線，支援拖拉、上下左右縮放、關閉、收合；標題列高度等於一格。",
  "視窗最終擺放不得重疊且不得超出邊界；若附近空間可容納，會優先裁切到不小於最小尺寸後放置。",
  "左側面板顯示使用者擁有但未在畫布上的工具；預設工具只有被關閉後才回到面板。",
  "左側面板支援 hover 展開與釘選，底部固定資料庫入口。",
  "關閉視窗時改用 GSAP 做整體收球動畫，投向左側面板後同步回彈。",
  "會員新增工具時優先自動串接使用者本機資料庫，並自動放入畫布空位；空間不足則收進左側工具面板。",
  "會員登入與工具市場延後，先完成畫布、工具與資料流。",
];

const coreFlow = [
  {
    icon: PackageCheck,
    title: "下載安裝包",
    summary: "使用者取得可一鍵啟動的平台安裝包。",
    suggestedForm: "下載頁 + 安裝檔版本卡片",
    question: "目前方向：以點開即可操作的桌面安裝體驗為目標；程式碼簽章憑證與發佈形式後續再討論。",
  },
  {
    icon: Server,
    title: "安裝地端系統",
    summary: "安裝本地服務、資料儲存位置與必要執行環境。",
    suggestedForm: "安裝精靈 + 健康檢查清單",
    question: "安裝過程要讓使用者選資料庫位置嗎，還是預設放在 AppData/使用者資料夾？",
  },
  {
    icon: LogIn,
    title: "登入帳號",
    summary: "登入後取得工具擴充、授權、同步或工具市場能力。",
    suggestedForm: "登入頁 / 初期可先以離線訪客模式替代",
    question: "目前決議：第一階段可先有登入 UI，但離線模式可直接使用；登入系統先不實作。",
  },
  {
    icon: LayoutGrid,
    title: "選擇行業模板",
    summary: "使用者選擇美業、寵物、診所、庫存、CRM 等預設模板。",
    suggestedForm: "模板卡片牆 + 搜尋/分類篩選",
    question: "目前決議：進入前一定要選模板；先提供美業、餐飲業、服務業與個人使用，後續可再更新行業。",
  },
  {
    icon: FolderInput,
    title: "匯入或建立資料庫",
    summary: "使用者可匯入既有資料，或依模板/AI 建立新資料庫。",
    suggestedForm: "三段式流程：匯入檔案、建立空白庫、AI 產生資料庫",
    question: "目前決議：行業模板先生成資料庫；匯入 CSV 時可做欄位 mapping，欄位名稱不同但內容相符時由 AI 建議對應。",
  },
  {
    icon: PanelTop,
    title: "進入對話式介面",
    summary: "平台主工作區，以聊天視窗作為操作入口，畫布承載工具。",
    suggestedForm: "40x24 滿版格線畫布 + 可拖拉對話視窗 + 左側工具面板",
    question: "目前決議：主畫面採可自由擺放的格線畫布，視窗尺寸與位置都必須貼合格子。",
  },
  {
    icon: MessageSquareText,
    title: "用自然語言查詢 / 新增 / 修改 / 啟動流程",
    summary: "使用者輸入需求，系統判斷是查詢、建表、改欄位、啟動自動化或叫出工具。",
    suggestedForm: "自然語言輸入列 + 指令建議 chip + 待確認卡片",
    question: "目前決議：離線版先聚焦本地資料庫查詢、新增、修改、刪除；確認卡片以選項方式呈現。",
  },
  {
    icon: Brain,
    title: "AI 解析意圖",
    summary: "AI 將自然語言拆成意圖、資料需求、欄位、流程與工具候選。",
    suggestedForm: "背景流程 + 可展開的解析摘要",
    question: "目前決議：語意不要寫死，應由 Gemma 判斷；使用者主要看到結果卡片，不需要額外外框包覆。",
  },
  {
    icon: Hammer,
    title: "執行本地資料庫或自動化工具",
    summary: "由本地執行器套用資料庫變更、查詢資料或觸發工具流程。",
    suggestedForm: "本地執行器 + 權限確認 + 執行紀錄",
    question: "目前決議：離線版先只處理平台內本地資料庫；會員工具與外部自動化延後。",
  },
  {
    icon: FilePlus2,
    title: "回傳結果卡片",
    summary: "將查詢結果、建議 schema、錯誤訊息或執行結果整理成卡片。",
    suggestedForm: "結果卡片 + 可套用/撤銷/加入畫布按鈕",
    question: "目前決議：回覆卡片走簡約質感，寬度依內容自適應，重要操作以選項呈現。",
  },
  {
    icon: ClipboardList,
    title: "本機保存操作紀錄",
    summary: "保存使用者原始輸入、AI 判斷、實際資料庫操作、確認狀態與執行結果。",
    suggestedForm: "本機操作時間線 + 可查看的變更摘要",
    question: "第一版先作為一般使用者可查看的操作歷史，未來再擴充復原、匯出與會員稽核。",
  },
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

export function DocsSite() {
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
          <a href="#flow"><GitBranch size={17} />流程</a>
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
            <strong>操作者介面原型</strong>
            <p>GitHub Pages 文件站與本機操作者介面並行；目前正在收斂畫布、工具面板與本地資料操作規格。</p>
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

        <Section id="flow" eyebrow="02 / Core Flow" title="核心操作流程">
          <div className="flow-intro">
            <p>
              依照你提供的流程圖，平台主流程從安裝、登入、模板、資料庫、對話操作，到 AI 意圖解析、
              本地執行、結果卡片與操作稽核。下方先整理成可討論的節點規格。
            </p>
          </div>
          <div className="flow-grid">
            {coreFlow.map((node, index) => {
              const Icon = node.icon;
              return (
                <article className="flow-card" key={node.title}>
                  <div className="flow-card-head">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <Icon size={22} />
                  </div>
                  <h3>{node.title}</h3>
                  <p>{node.summary}</p>
                  <div className="flow-meta">
                    <strong>建議形式</strong>
                    <span>{node.suggestedForm}</span>
                  </div>
                  <div className="flow-question">
                    <strong>目前紀錄</strong>
                    <span>{node.question}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </Section>

        <Section id="spec" eyebrow="03 / Specification" title="系統規格書">
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
            <div><strong>路由分工</strong><span>本機 localhost / 127.0.0.1 顯示操作者介面；GitHub Pages 顯示文件站</span></div>
            <div><strong>畫布</strong><span>桌面原型採 40x24 滿版格線，工具支援移動、上下左右縮放、收合與關閉</span></div>
            <div><strong>視窗規則</strong><span>尺寸與位置貼合格子，標題列一格高，最終不可重疊、不可超出邊界</span></div>
            <div><strong>左側面板</strong><span>顯示未在畫布上的工具，支援 hover 展開、釘選、底部固定資料庫入口</span></div>
            <div><strong>動畫</strong><span>關閉視窗使用 GSAP 做整體收球、精準投向面板 slot，接收時同步回彈</span></div>
            <div><strong>資料庫</strong><span>目前 localStorage 保存畫布位置；第一階段資料層規劃 IndexedDB，第二階段評估 SQLite WASM</span></div>
            <div><strong>AI</strong><span>離線 Gemma 優先，負責 Intent Parser、Schema Planner、Tool Matcher 與欄位 mapping 建議</span></div>
            <div><strong>部署</strong><span>GitHub Pages + GitHub Actions</span></div>
          </div>
        </Section>

        <Section id="roadmap" eyebrow="04 / Progress" title="開發進度監測">
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

        <Section id="decisions" eyebrow="05 / Decision Log" title="架構決策紀錄">
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
