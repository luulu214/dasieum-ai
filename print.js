const STORAGE_KEY = "dasieum-career-project-v1";

const $ = (selector) => document.querySelector(selector);

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function setText(selector, value, fallback = "-") {
  $(selector).textContent = value?.trim() || fallback;
}

function appendText(parent, tag, value, className) {
  const element = document.createElement(tag);
  element.textContent = value;
  if (className) element.className = className;
  parent.appendChild(element);
  return element;
}

function actionItems(state) {
  const goal = state.profile?.jobGoal || "희망 직무";
  const region = state.profile?.region || "희망 지역";
  return [
    ["DAY 1", "이력서 문장 적용", `승인한 Fact-Lock 문장 중 2개를 ${goal} 이력서에 넣기`],
    ["DAY 2", "공고 기준 찾기", `${region}의 ${goal} 공고 3개에서 반복되는 요구 역량 표시하기`],
    ["DAY 3", "문장 맞춤 수정", "가장 관심 있는 공고 1개에 맞춰 이력서 문장 순서와 표현 조정하기"],
    ["DAY 4", "30초 소개 연습", "생성된 자기소개를 소리 내어 3번 말하고 어색한 표현 고치기"],
    ["DAY 5", "STAR 답변 연습", "예상 면접 질문에 2분 안에 답하고 빠진 사실 확인하기"],
    ["DAY 6", "지원서 완성", "지원서 1건을 끝까지 작성하고 개인정보·날짜·수치 다시 확인하기"],
    ["DAY 7", "실제 지원", "공고 1개에 지원하고 다음 주 개선할 점 1개 기록하기"],
  ];
}

function renderFacts(state) {
  const container = $("#facts");
  (state.facts || []).forEach((fact, index) => {
    const card = document.createElement("article");
    card.className = "fact-item";
    appendText(card, "span", `FACT ${String(index + 1).padStart(2, "0")}`);
    appendText(card, "h3", fact.label || "경력 문장");
    appendText(card, "p", fact.text || "");
    appendText(card, "small", `근거 · ${fact.evidence || "사용자 확인 완료"}`);
    container.appendChild(card);
  });
}

function renderActions(state) {
  const container = $("#action-plan");
  actionItems(state).forEach(([day, title, copy], index) => {
    const item = document.createElement("div");
    item.className = `action-item ${state.actions?.[index] ? "done" : ""}`;
    appendText(item, "span", day);
    const content = document.createElement("span");
    appendText(content, "b", title);
    appendText(content, "small", copy);
    item.appendChild(content);
    appendText(item, "span", state.actions?.[index] ? "✓" : "", "check");
    container.appendChild(item);
  });
}

function reportText(state) {
  const facts = (state.facts || [])
    .map((fact, index) => `${index + 1}. ${fact.label || "경력 문장"}\n${fact.text || ""}`)
    .join("\n\n");
  const actions = actionItems(state)
    .map(([day, title, copy], index) => `${state.actions?.[index] ? "☑" : "☐"} ${day} · ${title}\n${copy}`)
    .join("\n\n");

  return [
    "다시이음 AI · 경력번역 결과",
    `희망 직무: ${state.profile?.jobGoal || "-"}`,
    `경험 유형: ${state.profile?.category || "-"}`,
    `희망 지역: ${state.profile?.region || "-"}`,
    "",
    "=== 검증된 경력 문장 ===",
    facts,
    "",
    "=== 이력서 핵심 문장 ===",
    state.outputs?.resume || "",
    "",
    "=== 30초 자기소개 ===",
    state.outputs?.intro || "",
    "",
    "=== 면접 STAR 답변 ===",
    state.outputs?.interview || "",
    "",
    "=== 7일 실행 계획 ===",
    actions,
  ].join("\n");
}

function downloadPrintableFile(state) {
  const content = reportText(state)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><title>다시이음 AI 경력번역 결과</title><style>@page{size:A4;margin:18mm}body{max-width:800px;margin:40px auto;color:#14201f;font:14px/1.8 Arial,"Noto Sans KR",sans-serif;white-space:pre-wrap}h1{color:#087d72}@media print{body{margin:0}}</style><body><h1>다시이음 AI</h1>${content}</body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `다시이음_${state.profile?.jobGoal || "경력번역"}_인쇄.html`;
  link.click();
  URL.revokeObjectURL(url);
}

const state = loadState();
const hasResults = Boolean(state?.outputs?.resume || state?.outputs?.intro || state?.outputs?.interview);

if (!hasResults) {
  $(".cover").hidden = true;
  document.querySelectorAll(".report-section").forEach((section) => {
    section.hidden = true;
  });
  $("#empty-state").hidden = false;
  $("#start-print").disabled = true;
  $("#download-print-file").disabled = true;
} else {
  setText("#job-goal", state.profile?.jobGoal);
  setText("#category", state.profile?.category);
  setText("#region", state.profile?.region, "전국 · 온라인");
  setText("#created-date", new Intl.DateTimeFormat("ko-KR", { dateStyle: "long" }).format(new Date()));
  setText("#resume-output", state.outputs?.resume);
  setText("#intro-output", state.outputs?.intro);
  setText("#interview-output", state.outputs?.interview);
  renderFacts(state);
  renderActions(state);
}

$("#start-print").addEventListener("click", () => window.print());
$("#download-print-file").addEventListener("click", () => downloadPrintableFile(state));
