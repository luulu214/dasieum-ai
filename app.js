const STORAGE_KEY = "dasieum-career-project-v1";

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

function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
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

function syncOutputsFromEditor() {
  state.outputs.resume = elements.resumeOutput.innerText.trim();
  state.outputs.intro = elements.introOutput.innerText.trim();
  state.outputs.interview = elements.interviewOutput.innerText.trim();
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

  $("#generate-facts").addEventListener("click", () => {
    if (!validateInterview()) return;
    buildFactStatements();
    unlockStep(3);
    showStep(3);
  });

  elements.buildResults.addEventListener("click", () => {
    buildOutputs();
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
}

populateInputs();
restoreGeneratedContent();
bindEvents();

elements.contextCategory.textContent = state.profile.category || "경험 유형";
elements.contextSummary.textContent = state.profile.experience || "입력한 경험이 여기에 표시됩니다.";
showStep(Math.min(state.currentStep, state.unlockedStep), { skipSave: true });
