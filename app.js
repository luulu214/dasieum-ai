const STORAGE_KEY = "dasieum-career-project-v1";
const API_KEY_STORAGE = "dasieum-upstage-api-key-session";
const UPSTAGE_API_URL = "https://api.upstage.ai/v1";
const UPSTAGE_MODEL = "solar-pro3";

const EXPERIENCE_EXAMPLES = [
  {
    id: "office",
    filter: "office",
    field: "사무·행정",
    title: "회비와 지출 내역 정리",
    jobGoal: "사무지원",
    category: "가사·가족사업",
    summary: "모임 총무를 맡아 회비 납부 내역과 월별 지출을 스프레드시트로 정리하고 구성원에게 공유했습니다.",
    tags: ["자료 정리", "정확성"],
  },
  {
    id: "schedule",
    filter: "office",
    field: "사무·행정",
    title: "가족 일정 통합 관리",
    jobGoal: "일정관리·사무보조",
    category: "돌봄·육아",
    summary: "가족의 병원, 학교, 공공기관 일정을 한 달 단위로 정리하고 필요한 서류와 준비물을 미리 확인했습니다.",
    tags: ["일정 관리", "사전 점검"],
  },
  {
    id: "customer",
    filter: "service",
    field: "고객응대",
    title: "문의와 주문 요청 대응",
    jobGoal: "고객상담",
    category: "가사·가족사업",
    summary: "가족이 운영하는 가게에서 전화와 메시지 문의를 확인하고 주문 내용, 전달사항, 배송 일정을 정리했습니다.",
    tags: ["고객 소통", "요청 정리"],
  },
  {
    id: "sales",
    filter: "service",
    field: "판매·매장",
    title: "재고 확인과 진열 개선",
    jobGoal: "매장관리",
    category: "가사·가족사업",
    summary: "판매가 잦은 상품과 부족한 재고를 수시로 확인하고 고객이 찾기 쉽도록 진열 위치와 안내 문구를 정리했습니다.",
    tags: ["재고 관리", "고객 관점"],
  },
  {
    id: "care",
    filter: "care",
    field: "돌봄·교육",
    title: "생활·학습 루틴 관리",
    jobGoal: "돌봄지원·교육보조",
    category: "돌봄·육아",
    summary: "아이의 등하원, 식사, 학습 시간을 일정하게 관리하고 변화가 있을 때 가족과 바로 공유해 일정을 조정했습니다.",
    tags: ["관찰", "일정 조율"],
  },
  {
    id: "event",
    filter: "field",
    field: "행사·지역운영",
    title: "행사 인력 재배치",
    jobGoal: "행사운영·현장지원",
    category: "봉사·지역 활동",
    summary: "지역 행사 준비 과정에서 참여자 가능 시간을 다시 확인하고 담당 구역별 인력을 조정해 운영 공백을 줄였습니다.",
    tags: ["현장 대응", "인력 조율"],
  },
  {
    id: "logistics",
    filter: "field",
    field: "물류·재고",
    title: "포장 순서와 누락 점검",
    jobGoal: "물류·재고관리",
    category: "가사·가족사업",
    summary: "발송할 물품을 주문 순서대로 분류하고 포장 전 목록과 실제 수량을 대조해 누락 여부를 확인했습니다.",
    tags: ["검수", "작업 순서"],
  },
  {
    id: "facility",
    filter: "field",
    field: "시설·환경관리",
    title: "공용공간 점검표 운영",
    jobGoal: "시설관리·환경미화",
    category: "봉사·지역 활동",
    summary: "공용공간의 청소 구역과 비품 상태를 점검표로 관리하고 부족한 소모품을 미리 확인해 보충했습니다.",
    tags: ["체크리스트", "예방 관리"],
  },
  {
    id: "digital",
    filter: "digital",
    field: "디지털·콘텐츠",
    title: "게시물 제작 일정 관리",
    jobGoal: "콘텐츠운영·마케팅보조",
    category: "학습·개인 프로젝트",
    summary: "개인 채널의 게시 주제와 업로드 일정을 정하고 이미지 편집 도구로 콘텐츠를 제작한 뒤 반응을 기록했습니다.",
    tags: ["콘텐츠 제작", "기록"],
  },
];

const emptyState = () => ({
  currentStep: 1,
  unlockedStep: 1,
  profile: {
    jobGoal: "",
    region: "",
    category: "",
    experience: "",
  },
  interview: {
    period: "",
    situation: "",
    role: "",
    action: "",
    tools: "",
    result: "",
  },
  facts: [],
  outputs: {
    resume: "",
    intro: "",
    interview: "",
  },
  actions: [false, false, false, false, false, false, false],
});

let state = loadState();
let activeResultTab = "resume";
let saveTimer;
let chatHistory = [];
let chatBusy = false;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const elements = {
  saveStatus: $("#save-status"),
  progressLabel: $("#progress-label"),
  progressPercent: $("#progress-percent"),
  progressBar: $("#progress-bar"),
  jobGoal: $("#job-goal"),
  region: $("#job-region"),
  experience: $("#experience-summary"),
  experienceCount: $("#experience-count"),
  contextCategory: $("#context-category"),
  contextSummary: $("#context-summary"),
  period: $("#answer-period"),
  situation: $("#answer-situation"),
  role: $("#answer-role"),
  action: $("#answer-action"),
  tools: $("#answer-tools"),
  result: $("#answer-result"),
  factList: $("#fact-list"),
  approvalCount: $("#approval-count"),
  buildResults: $("#build-results"),
  resumeOutput: $("#resume-output"),
  introOutput: $("#intro-output"),
  interviewOutput: $("#interview-output"),
  competencyTags: $("#competency-tags"),
  finalJobGoal: $("#final-job-goal"),
  actionPlan: $("#action-plan"),
  completionRate: $("#completion-rate"),
  completionRing: $("#completion-ring"),
  resetDialog: $("#reset-dialog"),
  aiDialog: $("#ai-dialog"),
  aiForm: $("#ai-form"),
  apiKey: $("#upstage-api-key"),
  aiStatusLabel: $("#ai-status-label"),
  aiConnectionMessage: $("#ai-connection-message"),
  disconnectAi: $("#disconnect-ai"),
  chatPanel: $("#chat-panel"),
  chatLauncher: $("#chat-launcher"),
  chatMessages: $("#chat-messages"),
  chatInput: $("#chat-input"),
  chatSend: $("#chat-send"),
  chatConnectionLabel: $("#chat-connection-label"),
  chatConnectAi: $("#chat-connect-ai"),
  exampleGrid: $("#experience-example-grid"),
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...emptyState(), ...saved } : emptyState();
  } catch {
    return emptyState();
  }
}

function queueSave() {
  elements.saveStatus.textContent = "저장 중…";
  elements.saveStatus.classList.add("saving");
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    elements.saveStatus.textContent = "자동 저장됨";
    elements.saveStatus.classList.remove("saving");
  }, 220);
}

function getApiKey() {
  return sessionStorage.getItem(API_KEY_STORAGE) || "";
}

function updateAiStatus() {
  const connected = Boolean(getApiKey());
  $("#ai-settings").classList.toggle("connected", connected);
  elements.aiStatusLabel.textContent = connected ? "Solar 연결됨" : "Solar AI 연결";
  elements.disconnectAi.hidden = !connected;
  elements.chatConnectionLabel.textContent = connected ? `${UPSTAGE_MODEL} 연결됨` : "Solar 연결 필요";
  elements.chatConnectAi.textContent = connected ? "연결 관리" : "AI 연결";
  elements.chatPanel.classList.toggle("connected", connected);
}

function setButtonLoading(button, loading, label) {
  const buttonLabel = button.querySelector(".button-label");
  button.disabled = loading;
  button.classList.toggle("loading", loading);
  if (buttonLabel) buttonLabel.textContent = loading ? label : button.dataset.defaultLabel;
}

function parseJsonResponse(content) {
  const clean = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("AI 응답 형식을 확인할 수 없습니다.");
  return JSON.parse(clean.slice(start, end + 1));
}

async function requestSolar(messages) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const response = await fetch(`${UPSTAGE_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: UPSTAGE_MODEL,
      messages,
      temperature: 0.2,
      stream: false,
    }),
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("API Key가 올바르지 않습니다. Solar 연결 설정에서 다시 확인해주세요.");
    }
    throw new Error(`Solar 연결에 실패했습니다. (${response.status})`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Solar 응답이 비어 있습니다.");
  return content;
}

async function callSolar(system, user) {
  return requestSolar([
    { role: "system", content: system },
    { role: "user", content: user },
  ]);
}

async function validateUpstageKey(apiKey) {
  const response = await fetch(`${UPSTAGE_API_URL}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error("유효하지 않은 API Key입니다.");
    throw new Error(`연결 확인에 실패했습니다. (${response.status})`);
  }
  return true;
}

function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderExperienceExamples(filter = "all") {
  const examples = filter === "all"
    ? EXPERIENCE_EXAMPLES
    : EXPERIENCE_EXAMPLES.filter((example) => example.filter === filter);

  elements.exampleGrid.innerHTML = examples
    .map(
      (example) => `
        <button class="example-card" type="button" data-example-id="${escapeHtml(example.id)}">
          <span class="example-field">${escapeHtml(example.field)}</span>
          <strong>${escapeHtml(example.title)}</strong>
          <p>${escapeHtml(example.summary)}</p>
          <span class="example-tags">${example.tags.map((tag) => `<b>${escapeHtml(tag)}</b>`).join("")}</span>
          <span class="example-apply">이 예시로 시작하기 <i>→</i></span>
        </button>
      `,
    )
    .join("");

  $$("[data-example-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const example = EXPERIENCE_EXAMPLES.find((item) => item.id === button.dataset.exampleId);
      if (!example) return;
      elements.jobGoal.value = example.jobGoal;
      elements.experience.value = example.summary;
      elements.experienceCount.textContent = example.summary.length;
      const categoryInput = $(`input[name="category"][value="${CSS.escape(example.category)}"]`);
      if (categoryInput) categoryInput.checked = true;
      syncStateFromInputs();
      queueSave();
      elements.experience.scrollIntoView({ behavior: "smooth", block: "center" });
      toast("예시를 입력했습니다. 실제 경험에 맞게 역할과 결과를 꼭 수정해주세요.");
    });
  });
}

function cleanSentence(value = "") {
  return value.trim().replace(/\s+/g, " ").replace(/[.。]+$/, "");
}

function ensureEnding(value = "") {
  const clean = cleanSentence(value);
  return clean ? `${clean}.` : "";
}

function firstUseful(...values) {
  return values.map(cleanSentence).find(Boolean) || "";
}

function compact(value, max = 130) {
  const clean = cleanSentence(value);
  return clean.length > max ? `${clean.slice(0, max).trim()}…` : clean;
}

function syncStateFromInputs() {
  state.profile.jobGoal = elements.jobGoal.value.trim();
  state.profile.region = elements.region.value.trim();
  state.profile.experience = elements.experience.value.trim();
  state.profile.category = $("input[name='category']:checked")?.value || "";
  state.interview.period = elements.period.value.trim();
  state.interview.situation = elements.situation.value.trim();
  state.interview.role = elements.role.value.trim();
  state.interview.action = elements.action.value.trim();
  state.interview.tools = elements.tools.value.trim();
  state.interview.result = elements.result.value.trim();
}

function populateInputs() {
  elements.jobGoal.value = state.profile.jobGoal;
  elements.region.value = state.profile.region;
  elements.experience.value = state.profile.experience;
  elements.experienceCount.textContent = state.profile.experience.length;
  const categoryInput = $(`input[name="category"][value="${CSS.escape(state.profile.category)}"]`);
  if (categoryInput) categoryInput.checked = true;

  elements.period.value = state.interview.period;
  elements.situation.value = state.interview.situation;
  elements.role.value = state.interview.role;
  elements.action.value = state.interview.action;
  elements.tools.value = state.interview.tools;
  elements.result.value = state.interview.result;
}

function showStep(step, options = {}) {
  if (step > state.unlockedStep) return;
  state.currentStep = step;

  $$(".step-section").forEach((section) => {
    const active = Number(section.dataset.step) === step;
    section.classList.toggle("active", active);
    section.hidden = !active;
  });

  $$(".step-link").forEach((button) => {
    const buttonStep = Number(button.dataset.stepTarget);
    const active = buttonStep === step;
    button.disabled = buttonStep > state.unlockedStep;
    button.classList.toggle("active", active);
    button.classList.toggle("complete", buttonStep < state.unlockedStep);
    if (active) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });

  const progress = step * 20;
  elements.progressLabel.textContent = `${step} / 5 단계`;
  elements.progressPercent.textContent = `${progress}%`;
  elements.progressBar.style.width = `${progress}%`;

  if (!options.skipSave) queueSave();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function unlockStep(step) {
  state.unlockedStep = Math.max(state.unlockedStep, step);
}

function validateStepOne() {
  syncStateFromInputs();
  const missing = [];
  if (!state.profile.jobGoal) missing.push(elements.jobGoal);
  if (!state.profile.category) missing.push($("#experience-categories"));
  if (state.profile.experience.length < 10) missing.push(elements.experience);

  if (missing.length) {
    missing[0].scrollIntoView({ behavior: "smooth", block: "center" });
    if (missing[0].focus) missing[0].focus();
    toast("희망 직무, 경험 유형, 10자 이상의 경험을 입력해주세요.");
    return false;
  }
  return true;
}

function validateInterview() {
  syncStateFromInputs();
  const required = [
    [elements.situation, state.interview.situation],
    [elements.role, state.interview.role],
    [elements.action, state.interview.action],
    [elements.result, state.interview.result],
  ];
  const missing = required.find(([, value]) => value.length < 5);
  if (missing) {
    missing[0].scrollIntoView({ behavior: "smooth", block: "center" });
    missing[0].focus();
    toast("상황·역할·행동·결과를 각각 5자 이상 적어주세요.");
    return false;
  }
  return true;
}

function buildFactStatements() {
  syncStateFromInputs();
  const p = state.profile;
  const a = state.interview;
  const periodPrefix = a.period ? `${cleanSentence(a.period)} 동안 ` : "";
  const toolsSuffix = a.tools ? ` ${cleanSentence(a.tools)} 방식으로 협업했습니다.` : "";

  const statements = [
    {
      id: "fact-role",
      label: "역할과 책임",
      text: `${periodPrefix}${cleanSentence(a.role)}.`,
      evidence: firstUseful(a.period, a.role),
      approved: false,
    },
    {
      id: "fact-action",
      label: "문제 해결 행동",
      text: `${cleanSentence(a.situation)} 상황에서 ${cleanSentence(a.action)}.${toolsSuffix}`,
      evidence: `${cleanSentence(a.situation)} / ${cleanSentence(a.action)}${a.tools ? ` / ${cleanSentence(a.tools)}` : ""}`,
      approved: false,
    },
    {
      id: "fact-result",
      label: "결과와 직무 연결",
      text: `${ensureEnding(a.result)} 이 경험은 ${cleanSentence(p.jobGoal)} 업무에 필요한 실행력과 조율 역량을 보여줍니다.`,
      evidence: `${cleanSentence(a.result)} / 희망 직무: ${cleanSentence(p.jobGoal)}`,
      approved: false,
    },
  ];

  state.facts = statements;
  renderFacts();
  queueSave();
}

async function buildFactStatementsWithAI() {
  const button = $("#generate-facts");
  if (!getApiKey()) {
    buildFactStatements();
    toast("기본 경력번역으로 만들었습니다. Solar를 연결하면 문장을 더 자연스럽게 다듬을 수 있어요.");
    return;
  }

  setButtonLoading(button, true, "Solar가 번역 중…");
  try {
    syncStateFromInputs();
    const source = {
      희망직무: state.profile.jobGoal,
      경험유형: state.profile.category,
      경험요약: state.profile.experience,
      기간: state.interview.period,
      상황: state.interview.situation,
      역할: state.interview.role,
      행동: state.interview.action,
      도구와협업: state.interview.tools,
      결과: state.interview.result,
    };
    const response = await callSolar(
      "당신은 한국어 경력기술서 편집자입니다. 사용자가 제공하지 않은 숫자, 기간, 성과, 도구를 절대 만들지 마세요. 과장 없이 사실만 명확하게 정리하고 JSON만 반환하세요.",
      `다음 경험을 희망 직무와 연결되는 3개의 경력 문장으로 정리하세요.
각 문장은 역할과 책임, 문제 해결 행동, 결과와 직무 연결을 하나씩 담당해야 합니다.
반환 형식: {"facts":[{"label":"역할과 책임","text":"...","evidence":"입력 근거 요약"},{"label":"문제 해결 행동","text":"...","evidence":"입력 근거 요약"},{"label":"결과와 직무 연결","text":"...","evidence":"입력 근거 요약"}]}
입력: ${JSON.stringify(source)}`,
    );
    const parsed = parseJsonResponse(response);
    if (!Array.isArray(parsed.facts) || parsed.facts.length !== 3) throw new Error("경력 문장 형식이 올바르지 않습니다.");
    state.facts = parsed.facts.map((fact, index) => ({
      id: ["fact-role", "fact-action", "fact-result"][index],
      label: String(fact.label || ["역할과 책임", "문제 해결 행동", "결과와 직무 연결"][index]),
      text: String(fact.text || ""),
      evidence: String(fact.evidence || ""),
      approved: false,
    }));
    renderFacts();
    queueSave();
    toast("Solar가 입력한 사실 안에서 경력 문장을 다듬었습니다.");
  } catch (error) {
    buildFactStatements();
    toast(`${error.message} 기본 경력번역으로 대신 만들었습니다.`);
  } finally {
    setButtonLoading(button, false, "");
  }
}

function renderFacts() {
  elements.factList.innerHTML = state.facts
    .map(
      (fact, index) => `
        <article class="fact-card" data-fact-id="${escapeHtml(fact.id)}">
          <div class="fact-card-top">
            <span>FACT ${String(index + 1).padStart(2, "0")} · ${escapeHtml(fact.label)}</span>
            <small>${fact.approved ? "확인됨" : "확인 필요"}</small>
          </div>
          <textarea rows="3" aria-label="${escapeHtml(fact.label)} 문장">${escapeHtml(fact.text)}</textarea>
          <div class="evidence-box">
            <b>연결된 원문 근거</b>
            <p>${escapeHtml(compact(fact.evidence, 220))}</p>
          </div>
          <div class="approval-control">
            <label>
              <input type="checkbox" ${fact.approved ? "checked" : ""} />
              실제 경험과 일치합니다
            </label>
          </div>
        </article>
      `,
    )
    .join("");

  $$(".fact-card").forEach((card) => {
    const fact = state.facts.find((item) => item.id === card.dataset.factId);
    card.querySelector("textarea").addEventListener("input", (event) => {
      fact.text = event.target.value;
      fact.approved = false;
      card.querySelector("input").checked = false;
      updateApprovalState();
      queueSave();
    });
    card.querySelector("input").addEventListener("change", (event) => {
      fact.approved = event.target.checked;
      card.querySelector("small").textContent = fact.approved ? "확인됨" : "확인 필요";
      updateApprovalState();
      queueSave();
    });
  });

  updateApprovalState();
}

function updateApprovalState() {
  const approved = state.facts.filter((fact) => fact.approved).length;
  elements.approvalCount.textContent = `${approved} / ${state.facts.length || 3} 문장`;
  elements.buildResults.disabled = approved !== state.facts.length || state.facts.length < 3;
}

function detectCompetencies() {
  const source = [
    state.profile.experience,
    ...Object.values(state.interview),
    ...state.facts.map((fact) => fact.text),
  ]
    .join(" ")
    .toLowerCase();

  const rules = [
    ["일정 관리", ["일정", "시간", "스케줄", "마감"]],
    ["운영·실행", ["운영", "진행", "실행", "완료"]],
    ["문제 해결", ["문제", "해결", "부족", "변경", "대응"]],
    ["의사소통", ["소통", "공유", "설명", "안내", "채팅"]],
    ["협업·조율", ["협업", "조율", "배치", "담당", "팀"]],
    ["고객 응대", ["고객", "문의", "상담", "응대"]],
    ["자료 관리", ["문서", "정리", "표", "스프레드시트", "기록"]],
    ["책임감", ["책임", "맡", "직접", "관리"]],
  ];

  const matches = rules.filter(([, keywords]) => keywords.some((keyword) => source.includes(keyword))).map(([label]) => label);
  return [...new Set(matches)].slice(0, 5).concat(matches.length < 3 ? ["상황 판단", "지속적 실행"].slice(0, 3 - matches.length) : []);
}

function buildOutputs() {
  const p = state.profile;
  const a = state.interview;
  const approved = state.facts.filter((fact) => fact.approved).map((fact) => cleanSentence(fact.text));
  const competencies = detectCompetencies();
  const region = p.region ? ` ${p.region} 지역의` : "";

  state.outputs.resume = approved.map((line) => `• ${ensureEnding(line)}`).join("\n");
  state.outputs.intro =
    `안녕하세요. 저는 ${p.category} 경험에서 ${competencies.slice(0, 3).join(", ")} 역량을 쌓았습니다. ` +
    `${cleanSentence(a.situation)} 상황에서 ${cleanSentence(a.action)}. 그 결과 ${cleanSentence(a.result)}. ` +
    `이 경험을 바탕으로${region} ${p.jobGoal} 업무에서 빠르게 상황을 파악하고 끝까지 실행하겠습니다.`;
  state.outputs.interview =
    `[예상 질문] ${p.category} 경험에서 문제를 해결한 사례를 말씀해주세요.\n\n` +
    `[S · 상황]\n${ensureEnding(a.situation)}\n\n` +
    `[T · 과제]\n${ensureEnding(a.role)}\n\n` +
    `[A · 행동]\n${ensureEnding(a.action)}${a.tools ? ` ${ensureEnding(a.tools)}` : ""}\n\n` +
    `[R · 결과]\n${ensureEnding(a.result)}`;

  elements.resumeOutput.textContent = state.outputs.resume;
  elements.introOutput.textContent = state.outputs.intro;
  elements.interviewOutput.textContent = state.outputs.interview;
  elements.competencyTags.innerHTML = competencies.map((tag) => `<b>${escapeHtml(tag)}</b>`).join("");
  queueSave();
}

async function buildOutputsWithAI() {
  const button = elements.buildResults;
  buildOutputs();
  if (!getApiKey()) return;

  setButtonLoading(button, true, "Solar가 작성 중…");
  try {
    const approvedFacts = state.facts.filter((fact) => fact.approved).map((fact) => fact.text);
    const response = await callSolar(
      "당신은 한국어 취업 문서 편집자입니다. 제공된 사실 밖의 정보는 만들지 말고, 과장·추측·허위 수치를 쓰지 마세요. 읽기 쉬운 한국어로 작성하고 JSON만 반환하세요.",
      `희망 직무 ${state.profile.jobGoal}, 경험 유형 ${state.profile.category}에 맞춰 아래 승인된 사실로 지원 문서를 작성하세요.
반환 형식: {"resume":"불릿 3개","intro":"30초 분량 자기소개","interview":"예상 질문 1개와 S/T/A/R 구조 답변"}
승인된 사실: ${JSON.stringify(approvedFacts)}
원문 답변: ${JSON.stringify(state.interview)}`,
    );
    const parsed = parseJsonResponse(response);
    if (!parsed.resume || !parsed.intro || !parsed.interview) throw new Error("지원 문서 형식이 올바르지 않습니다.");
    state.outputs.resume = String(parsed.resume);
    state.outputs.intro = String(parsed.intro);
    state.outputs.interview = String(parsed.interview);
    elements.resumeOutput.textContent = state.outputs.resume;
    elements.introOutput.textContent = state.outputs.intro;
    elements.interviewOutput.textContent = state.outputs.interview;
    queueSave();
    toast("Solar가 지원 문서를 완성했습니다.");
  } catch (error) {
    toast(`${error.message} 기본 결과물을 유지합니다.`);
  } finally {
    setButtonLoading(button, false, "");
  }
}

function syncOutputsFromEditor() {
  state.outputs.resume = elements.resumeOutput.textContent.trim();
  state.outputs.intro = elements.introOutput.textContent.trim();
  state.outputs.interview = elements.interviewOutput.textContent.trim();
}

function openPrintView() {
  syncStateFromInputs();
  syncOutputsFromEditor();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.location.href = "./print.html";
}

function buildActionPlan() {
  const goal = state.profile.jobGoal || "희망 직무";
  const region = state.profile.region || "희망 지역";
  const plan = [
    ["DAY 1", "이력서 문장 적용", `승인한 Fact-Lock 문장 중 2개를 ${goal} 이력서에 넣기`],
    ["DAY 2", "공고 기준 찾기", `${region}의 ${goal} 공고 3개에서 반복되는 요구 역량 표시하기`],
    ["DAY 3", "문장 맞춤 수정", "가장 관심 있는 공고 1개에 맞춰 이력서 문장 순서와 표현 조정하기"],
    ["DAY 4", "30초 소개 연습", "생성된 자기소개를 소리 내어 3번 말하고 어색한 표현 고치기"],
    ["DAY 5", "STAR 답변 연습", "예상 면접 질문에 2분 안에 답하고 빠진 사실 확인하기"],
    ["DAY 6", "지원서 완성", "지원서 1건을 끝까지 작성하고 개인정보·날짜·수치 다시 확인하기"],
    ["DAY 7", "실제 지원", "공고 1개에 지원하고 다음 주 개선할 점 1개 기록하기"],
  ];

  elements.actionPlan.innerHTML = plan
    .map(
      ([day, title, copy], index) => `
        <label class="action-item ${state.actions[index] ? "done" : ""}">
          <span class="action-day">${day}</span>
          <span><b>${escapeHtml(title)}</b><small>${escapeHtml(copy)}</small></span>
          <input type="checkbox" data-action-index="${index}" ${state.actions[index] ? "checked" : ""} aria-label="${escapeHtml(title)} 완료" />
        </label>
      `,
    )
    .join("");

  $$("[data-action-index]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const index = Number(checkbox.dataset.actionIndex);
      state.actions[index] = checkbox.checked;
      checkbox.closest(".action-item").classList.toggle("done", checkbox.checked);
      updateCompletion();
      queueSave();
    });
  });

  elements.finalJobGoal.textContent = goal;
  updateCompletion();
}

function updateCompletion() {
  const completed = state.actions.filter(Boolean).length;
  const percentage = Math.round((completed / 7) * 100);
  elements.completionRate.textContent = `${percentage}%`;
  elements.completionRing.style.background =
    `conic-gradient(var(--lime) ${percentage}%, rgba(255,255,255,.12) ${percentage}%)`;
}

function resultText() {
  return (
    `다시이음 AI · 경력번역 결과\n` +
    `희망 직무: ${state.profile.jobGoal}\n` +
    `경험 유형: ${state.profile.category}\n\n` +
    `=== 이력서 문장 ===\n${state.outputs.resume}\n\n` +
    `=== 30초 자기소개 ===\n${state.outputs.intro}\n\n` +
    `=== 면접 STAR 답변 ===\n${state.outputs.interview}\n`
  );
}

async function copyCurrentResult() {
  syncOutputsFromEditor();
  const text = state.outputs[activeResultTab];
  try {
    await navigator.clipboard.writeText(text);
    toast("현재 결과를 복사했습니다.");
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    toast("현재 결과를 복사했습니다.");
  }
}

function downloadResults() {
  syncOutputsFromEditor();
  const blob = new Blob([resultText()], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `다시이음_${state.profile.jobGoal || "경력번역"}_결과.txt`;
  link.click();
  URL.revokeObjectURL(url);
  queueSave();
}

function toast(message) {
  let toastElement = $(".toast");
  if (!toastElement) {
    toastElement = document.createElement("div");
    toastElement.className = "toast";
    Object.assign(toastElement.style, {
      position: "fixed",
      zIndex: "999",
      right: "22px",
      bottom: "22px",
      maxWidth: "340px",
      padding: "13px 17px",
      color: "#fff",
      borderRadius: "11px",
      background: "#14201f",
      boxShadow: "0 15px 40px rgba(0,0,0,.2)",
      fontSize: "12px",
      fontWeight: "700",
      transition: "opacity .2s ease",
    });
    document.body.appendChild(toastElement);
  }
  toastElement.textContent = message;
  toastElement.style.opacity = "1";
  window.clearTimeout(toastElement.hideTimer);
  toastElement.hideTimer = window.setTimeout(() => {
    toastElement.style.opacity = "0";
  }, 2600);
}

function openAiDialog() {
  elements.apiKey.value = "";
  elements.apiKey.type = "password";
  $("#toggle-api-key").textContent = "보기";
  elements.aiConnectionMessage.textContent = getApiKey()
    ? "Solar가 연결되어 있습니다. 새 키를 입력하면 현재 연결을 교체할 수 있습니다."
    : "API Key는 AI 생성 요청을 위해 api.upstage.ai로만 전송됩니다.";
  elements.aiConnectionMessage.className = "connection-message";
  updateAiStatus();
  elements.aiDialog.showModal();
}

function addChatMessage(role, text) {
  const message = document.createElement("article");
  message.className = `chat-message ${role}`;
  const label = document.createElement("span");
  label.textContent = role === "user" ? "나" : "다시이음 AI";
  const copy = document.createElement("p");
  copy.textContent = text;
  message.append(label, copy);
  elements.chatMessages.appendChild(message);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
  return message;
}

function ensureChatWelcome() {
  if (elements.chatMessages.children.length) return;
  addChatMessage(
    "assistant",
    "안녕하세요. 입력한 경험을 바탕으로 이력서 문장, 강점 찾기, 면접 연습을 도와드릴게요. 무엇이 가장 궁금한가요?",
  );
}

function openChat() {
  ensureChatWelcome();
  elements.chatPanel.hidden = false;
  elements.chatLauncher.classList.add("panel-open");
  elements.chatLauncher.setAttribute("aria-expanded", "true");
  window.setTimeout(() => elements.chatInput.focus(), 50);
}

function closeChat() {
  elements.chatPanel.hidden = true;
  elements.chatLauncher.classList.remove("panel-open");
  elements.chatLauncher.setAttribute("aria-expanded", "false");
}

function chatContext() {
  return {
    희망직무: state.profile.jobGoal || "미입력",
    희망지역: state.profile.region || "미입력",
    경험유형: state.profile.category || "미입력",
    경험요약: state.profile.experience || "미입력",
    인터뷰답변: state.interview,
    승인된경력문장: state.facts.filter((fact) => fact.approved).map((fact) => fact.text),
    현재지원문서: state.outputs,
  };
}

function setChatBusy(busy) {
  chatBusy = busy;
  elements.chatInput.disabled = busy;
  elements.chatSend.disabled = busy;
  elements.chatSend.textContent = busy ? "…" : "↑";
  elements.chatPanel.classList.toggle("thinking", busy);
}

async function sendChatMessage(rawMessage) {
  const message = rawMessage.trim();
  if (!message || chatBusy) return;

  addChatMessage("user", message);
  elements.chatInput.value = "";

  if (!getApiKey()) {
    addChatMessage(
      "assistant",
      "Solar AI 연결이 필요해요. 채팅창 위의 ‘AI 연결’을 눌러 Upstage API Key를 연결하면 바로 상담할 수 있습니다.",
    );
    return;
  }

  chatHistory.push({ role: "user", content: message });
  chatHistory = chatHistory.slice(-10);
  setChatBusy(true);
  const typing = addChatMessage("assistant", "답변을 정리하고 있어요…");
  typing.classList.add("typing");

  try {
    const system = `당신은 다시이음 AI의 한국어 커리어 코치입니다.
사용자의 생활 경험을 취업에 활용할 수 있도록 구체적이고 따뜻하게 돕습니다.
제공된 맥락에 없는 수치, 기간, 성과, 자격, 경력을 절대 만들어내지 마세요.
협업 대상, 사용 도구, 결과의 의미도 맥락에 명시되지 않았다면 추측하지 마세요.
정보가 부족하면 추측하지 말고 한 번에 한 가지 질문만 하세요.
답변은 모바일에서 읽기 좋게 5문장 이내를 기본으로 하되, 사용자가 자세한 설명을 원하면 확장하세요.
별표, 해시, 굵게 표시 같은 마크다운 기호는 쓰지 말고 일반 텍스트와 번호만 사용하세요.
취업 결과를 보장하지 말고 최종 지원 전 사실과 공고 확인을 안내하세요.
현재 사용자 맥락: ${JSON.stringify(chatContext())}`;
    const response = await requestSolar([
      { role: "system", content: system },
      ...chatHistory,
    ]);
    typing.remove();
    addChatMessage("assistant", response);
    chatHistory.push({ role: "assistant", content: response });
    chatHistory = chatHistory.slice(-10);
  } catch (error) {
    typing.remove();
    addChatMessage(
      "assistant",
      `${error.message} 상단의 AI 연결 설정을 확인한 뒤 다시 질문해주세요.`,
    );
  } finally {
    setChatBusy(false);
    elements.chatInput.focus();
  }
}

function resetProject() {
  localStorage.removeItem(STORAGE_KEY);
  state = emptyState();
  activeResultTab = "resume";
  populateInputs();
  elements.factList.innerHTML = "";
  elements.resumeOutput.textContent = "";
  elements.introOutput.textContent = "";
  elements.interviewOutput.textContent = "";
  elements.competencyTags.innerHTML = "";
  buildActionPlan();
  showStep(1);
  toast("새 경력번역을 시작합니다.");
}

function restoreGeneratedContent() {
  if (state.facts.length) renderFacts();
  if (state.outputs.resume) {
    elements.resumeOutput.textContent = state.outputs.resume;
    elements.introOutput.textContent = state.outputs.intro;
    elements.interviewOutput.textContent = state.outputs.interview;
    elements.competencyTags.innerHTML = detectCompetencies().map((tag) => `<b>${escapeHtml(tag)}</b>`).join("");
  }
  buildActionPlan();
}

function bindEvents() {
  const autosaveInputs = $$("input[type='text'], textarea");
  autosaveInputs.forEach((input) => {
    input.addEventListener("input", () => {
      syncStateFromInputs();
      if (input === elements.experience) elements.experienceCount.textContent = input.value.length;
      queueSave();
    });
  });

  $$("input[name='category']").forEach((input) => {
    input.addEventListener("change", () => {
      syncStateFromInputs();
      queueSave();
    });
  });

  $$(".step-link").forEach((button) => {
    button.addEventListener("click", () => showStep(Number(button.dataset.stepTarget)));
  });

  $$("[data-back]").forEach((button) => {
    button.addEventListener("click", () => showStep(Number(button.dataset.back)));
  });

  $("#to-step-2").addEventListener("click", () => {
    if (!validateStepOne()) return;
    elements.contextCategory.textContent = state.profile.category;
    elements.contextSummary.textContent = state.profile.experience;
    unlockStep(2);
    showStep(2);
  });

  $("#generate-facts").addEventListener("click", async () => {
    if (!validateInterview()) return;
    await buildFactStatementsWithAI();
    unlockStep(3);
    showStep(3);
  });

  elements.buildResults.addEventListener("click", async () => {
    await buildOutputsWithAI();
    unlockStep(4);
    showStep(4);
  });

  $$(".editable-result").forEach((output) => {
    output.addEventListener("input", () => {
      syncOutputsFromEditor();
      queueSave();
    });
  });

  $$("[data-result-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      activeResultTab = button.dataset.resultTab;
      $$("[data-result-tab]").forEach((tab) => {
        const active = tab === button;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
      });
      $$("[data-result-panel]").forEach((panel) => {
        const active = panel.dataset.resultPanel === activeResultTab;
        panel.classList.toggle("active", active);
        panel.hidden = !active;
      });
    });
  });

  $("#copy-current").addEventListener("click", copyCurrentResult);
  $("#download-results").addEventListener("click", downloadResults);
  $("#to-step-5").addEventListener("click", () => {
    syncOutputsFromEditor();
    buildActionPlan();
    unlockStep(5);
    showStep(5);
  });
  $("#print-results").addEventListener("click", openPrintView);
  $("#restart-service").addEventListener("click", () => elements.resetDialog.showModal());
  $("#reset-top").addEventListener("click", () => elements.resetDialog.showModal());
  $("#confirm-reset").addEventListener("click", resetProject);
  $("#ai-settings").addEventListener("click", openAiDialog);
  $("#close-ai-dialog").addEventListener("click", () => elements.aiDialog.close());
  $("#toggle-api-key").addEventListener("click", () => {
    const visible = elements.apiKey.type === "text";
    elements.apiKey.type = visible ? "password" : "text";
    $("#toggle-api-key").textContent = visible ? "보기" : "숨기기";
  });
  elements.disconnectAi.addEventListener("click", () => {
    sessionStorage.removeItem(API_KEY_STORAGE);
    updateAiStatus();
    elements.aiDialog.close();
    toast("Solar 연결을 해제했습니다.");
  });
  elements.aiForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const key = elements.apiKey.value.trim();
    if (!key) return;
    const connectButton = $("#connect-ai");
    connectButton.disabled = true;
    connectButton.textContent = "연결 확인 중…";
    elements.aiConnectionMessage.textContent = "Upstage에 안전하게 연결하고 있습니다.";
    elements.aiConnectionMessage.className = "connection-message checking";
    try {
      await validateUpstageKey(key);
      sessionStorage.setItem(API_KEY_STORAGE, key);
      updateAiStatus();
      elements.aiConnectionMessage.textContent = `연결되었습니다. ${UPSTAGE_MODEL}로 경력 문장을 생성합니다.`;
      elements.aiConnectionMessage.className = "connection-message success";
      window.setTimeout(() => elements.aiDialog.close(), 700);
    } catch (error) {
      elements.aiConnectionMessage.textContent = `${error.message} 브라우저에서 연결이 차단되면 기본 번역 기능을 이용해주세요.`;
      elements.aiConnectionMessage.className = "connection-message error";
    } finally {
      connectButton.disabled = false;
      connectButton.textContent = "연결 확인";
    }
  });
  elements.chatLauncher.addEventListener("click", openChat);
  $("#chat-close").addEventListener("click", closeChat);
  elements.chatConnectAi.addEventListener("click", openAiDialog);
  $("#chat-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    await sendChatMessage(elements.chatInput.value);
  });
  elements.chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      $("#chat-form").requestSubmit();
    }
  });
  $$("[data-chat-prompt]").forEach((button) => {
    button.addEventListener("click", async () => {
      await sendChatMessage(button.dataset.chatPrompt);
    });
  });
  $$("[data-example-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      $$("[data-example-filter]").forEach((filterButton) => {
        filterButton.classList.toggle("active", filterButton === button);
      });
      renderExperienceExamples(button.dataset.exampleFilter);
    });
  });
}

populateInputs();
restoreGeneratedContent();
renderExperienceExamples();
bindEvents();
updateAiStatus();

elements.contextCategory.textContent = state.profile.category || "경험 유형";
elements.contextSummary.textContent = state.profile.experience || "입력한 경험이 여기에 표시됩니다.";
showStep(Math.min(state.currentStep, state.unlockedStep), { skipSave: true });
