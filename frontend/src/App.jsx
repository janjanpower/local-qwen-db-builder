import { useMemo, useState } from "react";
import { Bot, ListChecks, RefreshCw, Send, Server } from "lucide-react";
import { DatabaseCard } from "./components/DatabaseCard";
import { DatabaseDock } from "./components/DatabaseDock";
import { MessageBubble } from "./components/MessageBubble";
import { PendingPlanCard } from "./components/PendingPlanCard";

const quickPrompts = [
  "我要建立一個寵物服務管理工具，要有寵物名稱、寵物種類、飼主姓名、聯絡電話、服務項目、預約日期、服務金額、特殊注意事項",
  "寵物名稱改成寵物名字",
  "新增一個過敏備註欄位",
  "刪除特殊注意事項欄位",
  "查看目前工具清單"
];

const fieldTypeHints = [
  { keywords: ["日期", "時間", "預約"], type: "datetime" },
  { keywords: ["金額", "價格", "費用", "數量"], type: "number" },
  { keywords: ["是否", "完成"], type: "boolean" }
];

function toFieldKey(label, index) {
  const knownKeys = {
    寵物名稱: "pet_name",
    寵物名字: "pet_name",
    寵物種類: "pet_type",
    飼主姓名: "owner_name",
    聯絡電話: "phone",
    服務項目: "service_item",
    預約日期: "appointment_date",
    服務金額: "service_amount",
    特殊注意事項: "special_notes",
    過敏備註: "allergy_notes"
  };

  if (knownKeys[label]) return knownKeys[label];
  return `field_${index + 1}`;
}

function inferType(label) {
  const matched = fieldTypeHints.find((hint) => hint.keywords.some((keyword) => label.includes(keyword)));
  return matched?.type || "text";
}

function createField(label, index) {
  return {
    field_key: toFieldKey(label, index),
    display_name: label,
    data_type: inferType(label)
  };
}

function extractFields(text) {
  const afterMarker = text.includes("要有") ? text.split("要有").pop() : text;
  const fields = afterMarker
    .split(/[、,，]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => !item.includes("我要建立") && item.length <= 12);

  if (fields.length > 0) return fields;

  return ["名稱", "分類", "日期", "金額", "備註"];
}

function createPlanFromPrompt(text) {
  const isPetService = text.includes("寵物");
  const labels = isPetService
    ? extractFields(text)
    : ["名稱", "分類", "日期", "金額", "備註"];

  const schema = {
    tool_name: isPetService ? "寵物服務管理工具" : "自訂資料管理工具",
    table_name: isPetService ? "pet_services" : "custom_records",
    fields: labels.map(createField)
  };

  return {
    plan_id: `plan_${Date.now()}`,
    id: `plan_${Date.now()}`,
    message: "已依照你的描述產生資料庫建議，請確認後建立。",
    model_source: "static-rule-engine",
    schema,
    status: "pending"
  };
}

function planFieldToToolField(field, index) {
  return {
    id: `${field.field_key}_${index}`,
    field_key: field.field_key,
    display_name: field.display_name,
    data_type: field.data_type
  };
}

function createToolFromPlan(plan) {
  const fields = plan.schema.fields.map(planFieldToToolField);
  return {
    id: `tool_${Date.now()}`,
    tool_name: plan.schema.tool_name,
    table_name: plan.schema.table_name,
    db_connected: true,
    fields,
    field_count: fields.length,
    record_count: 0,
    records: []
  };
}

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "請描述你想建立的資料庫工具。這是 GitHub Pages 可部署的靜態前端模式，不需要後端也能建立待確認卡片與本地前端資料表。"
    }
  ]);
  const [plans, setPlans] = useState([]);
  const [tools, setTools] = useState([]);
  const [activePlanId, setActivePlanId] = useState(null);
  const [showDatabase, setShowDatabase] = useState(false);
  const [dockCollapsed, setDockCollapsed] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [loading, setLoading] = useState(false);

  const activePlan = useMemo(
    () => plans.find((plan) => (plan.plan_id || plan.id) === activePlanId) || null,
    [plans, activePlanId]
  );

  function addAssistantMessage(content) {
    setMessages((prev) => [...prev, { role: "assistant", content }]);
  }

  function updateActivePlanFields(updater) {
    if (!activePlan) {
      addAssistantMessage("目前沒有待確認卡片。請先描述你想建立的資料庫工具。");
      return false;
    }

    const planId = activePlan.plan_id || activePlan.id;
    setPlans((prev) =>
      prev.map((plan) => {
        if ((plan.plan_id || plan.id) !== planId) return plan;
        return {
          ...plan,
          schema: {
            ...plan.schema,
            fields: updater(plan.schema.fields)
          }
        };
      })
    );
    return true;
  }

  function handleCommand(text) {
    if (text.includes("查看目前工具清單")) {
      const summary =
        tools.length === 0
          ? "目前尚未建立任何 TABLE。"
          : tools.map((tool) => `${tool.tool_name}（${tool.table_name}，${tool.field_count} 欄，${tool.record_count} 筆）`).join("\n");
      addAssistantMessage(summary);
      return true;
    }

    if (text.includes("改成")) {
      const [fromName, toName] = text.split("改成").map((part) => part.trim());
      const didUpdate = updateActivePlanFields((fields) =>
        fields.map((field, index) =>
          field.display_name === fromName
            ? { ...createField(toName, index), data_type: field.data_type }
            : field
        )
      );
      if (didUpdate) addAssistantMessage(`已將「${fromName}」更新為「${toName}」，請確認待確認卡片。`);
      return true;
    }

    if (text.includes("新增") && text.includes("欄位")) {
      const fieldName = text.replace("新增一個", "").replace("新增", "").replace("欄位", "").trim();
      const didUpdate = updateActivePlanFields((fields) => [...fields, createField(fieldName || "新欄位", fields.length)]);
      if (didUpdate) addAssistantMessage(`已新增「${fieldName || "新欄位"}」欄位。`);
      return true;
    }

    if (text.includes("刪除") && text.includes("欄位")) {
      const fieldName = text.replace("刪除", "").replace("欄位", "").trim();
      const didUpdate = updateActivePlanFields((fields) => fields.filter((field) => field.display_name !== fieldName));
      if (didUpdate) addAssistantMessage(`已刪除「${fieldName}」欄位。`);
      return true;
    }

    return false;
  }

  async function submitMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    window.setTimeout(() => {
      if (!handleCommand(text)) {
        const plan = createPlanFromPrompt(text);
        setPlans((prev) => [plan, ...prev]);
        setActivePlanId(plan.plan_id);
        addAssistantMessage(`${plan.message} 判斷來源：${plan.model_source}。`);
      }
      setLoading(false);
    }, 220);
  }

  async function applyPlan() {
    if (!activePlan) return;
    setLoading(true);

    window.setTimeout(() => {
      const tool = createToolFromPlan(activePlan);
      const planId = activePlan.plan_id || activePlan.id;

      setTools((prev) => [tool, ...prev]);
      setPlans((prev) => prev.map((plan) => ((plan.plan_id || plan.id) === planId ? { ...plan, status: "applied" } : plan)));
      addAssistantMessage(`已建立工具。tool_id：${tool.id}。左側資料庫 ICON 可查看 TABLE、編輯欄位與新增資料筆數。`);
      setActivePlanId(null);
      setShowDatabase(true);
      setLoading(false);
    }, 220);
  }

  async function renameField(toolId, fieldId, name) {
    setTools((prev) =>
      prev.map((tool) => {
        if (tool.id !== toolId) return tool;
        const fields = tool.fields.map((field) => (field.id === fieldId ? { ...field, display_name: name } : field));
        return { ...tool, fields };
      })
    );
  }

  async function deleteFields(toolId, fieldIds) {
    setTools((prev) =>
      prev.map((tool) => {
        if (tool.id !== toolId) return tool;
        const fields = tool.fields.filter((field) => !fieldIds.includes(field.id));
        return { ...tool, fields, field_count: fields.length };
      })
    );
  }

  async function addField(toolId, name) {
    setTools((prev) =>
      prev.map((tool) => {
        if (tool.id !== toolId) return tool;
        const nextField = planFieldToToolField(createField(name, tool.fields.length), tool.fields.length);
        const fields = [...tool.fields, nextField];
        return { ...tool, fields, field_count: fields.length };
      })
    );
  }

  async function addRecord(toolId) {
    setTools((prev) =>
      prev.map((tool) => {
        if (tool.id !== toolId) return tool;
        const payload = Object.fromEntries(tool.fields.map((field) => [field.field_key, ""]));
        const records = [...tool.records, { id: `record_${Date.now()}`, payload }];
        return { ...tool, records, record_count: records.length };
      })
    );
  }

  async function deleteTool(toolId) {
    setTools((prev) => prev.filter((tool) => tool.id !== toolId));
  }

  return (
    <main className="app-shell">
      <DatabaseDock
        collapsed={dockCollapsed}
        setCollapsed={setDockCollapsed}
        onOpen={() => setShowDatabase(true)}
        toolCount={tools.length}
      />

      <section className="chat-main">
        <header className="top-bar">
          <div className="brand-block">
            <div className="logo-box"><Bot size={22} /></div>
            <div>
              <h1>Local Qwen DB Builder</h1>
              <p>靜態前端模式，可部署到 GitHub Pages</p>
            </div>
          </div>
          <div className="top-actions">
            <div className="health-pill">
              <Server size={15} />
              <span>前端已就緒</span>
              <span>static</span>
            </div>
            <button className="secondary-button" onClick={() => setShowGuide(!showGuide)}>
              <ListChecks size={16} /> 指令範例
            </button>
          </div>
        </header>

        {showGuide && <section className="guide-panel">{quickPrompts.map((prompt) => <button key={prompt} onClick={() => setInput(prompt)}>{prompt}</button>)}</section>}

        <div className="messages">
          {messages.map((message, index) => <MessageBubble key={index} role={message.role}>{message.content}</MessageBubble>)}
          {activePlan && activePlan.status !== "applied" && <PendingPlanCard plan={activePlan} onApply={applyPlan} loading={loading} />}
        </div>

        <footer className="input-area">
          <div className="quick-prompts">{quickPrompts.map((prompt) => <button key={prompt} onClick={() => setInput(prompt)}>{prompt}</button>)}</div>
          <div className="composer">
            <textarea
              value={input}
              placeholder="輸入：我要建立一個寵物服務管理工具..."
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submitMessage();
                }
              }}
            />
            <button className="send-button" onClick={submitMessage} disabled={loading}>
              {loading ? <RefreshCw size={18} className="spin" /> : <Send size={18} />}
            </button>
          </div>
        </footer>
      </section>

      {showDatabase && (
        <DatabaseCard
          tools={tools}
          onClose={() => setShowDatabase(false)}
          onRefresh={() => undefined}
          onRenameField={renameField}
          onDeleteFields={deleteFields}
          onAddField={addField}
          onAddRecord={addRecord}
          onDeleteTool={deleteTool}
        />
      )}
    </main>
  );
}
