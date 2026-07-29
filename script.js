const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");

menuToggle?.addEventListener("click", () => {
  const open = primaryNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

primaryNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    primaryNav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const flowData = {
  discover: {
    step: "STEP 01 · EXPERIENCE DISCOVERY",
    title: "당신이 실제로 해낸 일을 찾아볼게요.",
    copy: "거창한 성과가 아니어도 괜찮습니다. 반복해서 맡았던 일, 누군가에게 도움을 준 일, 문제를 해결한 순간부터 시작합니다.",
    progress: "25%",
    content: `
      <button type="button">돌봄·육아</button>
      <button type="button">가사·가족사업</button>
      <button type="button">봉사·지역 활동</button>
      <button type="button">학습·개인 프로젝트</button>
    `,
  },
  interview: {
    step: "STEP 02 · AI STRUCTURED INTERVIEW",
    title: "그때 가장 먼저 해결해야 했던 문제는 무엇이었나요?",
    copy: "한 화면에 하나씩 묻고, 어려운 표현 대신 쉬운 예시를 제공합니다. 입력한 답변은 자동으로 저장됩니다.",
    progress: "50%",
    content: `
      <div class="answer-card">
        <b>답변 예시</b>
        <span>봉사자 일정이 겹쳐 행사 당일 인력이 부족할 가능성이 있었습니다.</span>
      </div>
      <button type="button">음성으로 답하기</button>
      <button type="button">다음 질문</button>
    `,
  },
  factlock: {
    step: "STEP 03 · FACT-LOCK",
    title: "이 문장이 실제 경험과 정확히 맞나요?",
    copy: "생성된 모든 문장은 원문 근거와 연결됩니다. 사용자가 확인·수정·삭제한 뒤에만 최종 결과로 확정합니다.",
    progress: "75%",
    content: `
      <div class="answer-card">
        <b>12명 규모의 운영 인력을 배치하고 일정 충돌을 조정했습니다.</b>
        <span>근거: “지역 축제에서 12명의 자원봉사 일정을 조율했어요.”</span>
      </div>
      <button type="button">✓ 사실과 일치해요</button>
      <button type="button">문장 수정하기</button>
    `,
  },
  action: {
    step: "STEP 04 · ACTION PLAN",
    title: "이제 경력 문장을 실제 지원으로 연결합니다.",
    copy: "희망 직무에 맞춘 이력서 문장, 예상 면접 질문, 채용공고 적합도와 오늘 할 수 있는 행동을 제안합니다.",
    progress: "100%",
    content: `
      <div class="answer-card">
        <b>오늘의 행동 · 1/3</b>
        <span>관심 공고 1개를 저장하고, Fact-Lock 문장 2개를 지원서에 적용하세요.</span>
      </div>
      <button type="button">공고 적합도 보기</button>
      <button type="button">7일 계획 저장</button>
    `,
  },
};

const flowItems = document.querySelectorAll(".flow-item");
const previewTitle = document.querySelector("#preview-title");
const previewCopy = document.querySelector("#preview-copy");
const previewStep = document.querySelector(".preview-step");
const previewContent = document.querySelector("#preview-content");
const previewProgress = document.querySelector(".preview-progress span");

flowItems.forEach((item) => {
  item.addEventListener("click", () => {
    const next = flowData[item.dataset.flow];
    if (!next) return;

    flowItems.forEach((button) => {
      const active = button === item;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    previewStep.textContent = next.step;
    previewTitle.textContent = next.title;
    previewCopy.textContent = next.copy;
    previewContent.innerHTML = next.content;
    previewProgress.style.width = next.progress;
  });
});

const tabA = document.querySelector("#tab-a");
const tabB = document.querySelector("#tab-b");
const panelA = document.querySelector("#roadmap-a");
const panelB = document.querySelector("#roadmap-b");

function activateRoadmap(selected) {
  const showA = selected === "a";
  tabA.classList.toggle("active", showA);
  tabB.classList.toggle("active", !showA);
  tabA.setAttribute("aria-selected", String(showA));
  tabB.setAttribute("aria-selected", String(!showA));
  panelA.hidden = !showA;
  panelB.hidden = showA;
  panelA.classList.toggle("active", showA);
  panelB.classList.toggle("active", !showA);
}

tabA?.addEventListener("click", () => activateRoadmap("a"));
tabB?.addEventListener("click", () => activateRoadmap("b"));
