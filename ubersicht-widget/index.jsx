const POS_KEY = "takoyaki-todo-widget-pos";
const APP_ORIGIN = "http://localhost:8123";

function getSavedPos() {
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { top: 40, left: 40 };
}

function savePos(pos) {
  try {
    localStorage.setItem(POS_KEY, JSON.stringify(pos));
  } catch (e) {}
}

let dragOverlay = null;
function getDragOverlay() {
  if (!dragOverlay) {
    dragOverlay = document.createElement("div");
    Object.assign(dragOverlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "999999",
      cursor: "grabbing",
      background: "transparent",
    });
  }
  return dragOverlay;
}

const setupDrag = (handleEl) => {
  if (!handleEl || handleEl.dataset.dragReady) return;
  handleEl.dataset.dragReady = "1";

  const widgetEl = handleEl.parentElement;
  const pos = getSavedPos();
  widgetEl.style.top = pos.top + "px";
  widgetEl.style.left = pos.left + "px";

  let startX = 0;
  let startY = 0;
  let startTop = 0;
  let startLeft = 0;
  let dragging = false;

  const onMouseMove = (e) => {
    if (!dragging) return;
    widgetEl.style.top = startTop + (e.clientY - startY) + "px";
    widgetEl.style.left = startLeft + (e.clientX - startX) + "px";
  };

  const onMouseUp = () => {
    if (!dragging) return;
    dragging = false;
    const overlay = getDragOverlay();
    if (overlay.parentElement) overlay.parentElement.removeChild(overlay);
    savePos({
      top: parseInt(widgetEl.style.top, 10) || 0,
      left: parseInt(widgetEl.style.left, 10) || 0,
    });
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  handleEl.addEventListener("mousedown", (e) => {
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startTop = parseInt(widgetEl.style.top, 10) || 0;
    startLeft = parseInt(widgetEl.style.left, 10) || 0;
    document.body.appendChild(getDragOverlay());
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    e.preventDefault();
  });
};

const mountApp = (containerEl) => {
  if (!containerEl || containerEl.dataset.mounted) return;
  containerEl.dataset.mounted = "1";

  if (!document.getElementById("takoyaki-todo-style")) {
    const link = document.createElement("link");
    link.id = "takoyaki-todo-style";
    link.rel = "stylesheet";
    link.href = APP_ORIGIN + "/style.css?v=" + Date.now();
    document.head.appendChild(link);
  }

  fetch(APP_ORIGIN + "/index.html?v=" + Date.now())
    .then((r) => r.text())
    .then((html) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const root = doc.querySelector(".app-root");
      containerEl.innerHTML = root ? root.outerHTML : doc.body.innerHTML;

      const appRoot = containerEl.querySelector(".app-root");
      if (appRoot) {
        appRoot.style.minHeight = "0";
        appRoot.style.height = "100%";
      }

      // innerHTML로 삽입되면 상대경로(assets/...)가 Übersicht 문서 기준으로 풀려서
      // 깨지므로, 절대경로로 다시 써준다.
      containerEl.querySelectorAll("img[src]").forEach((img) => {
        const src = img.getAttribute("src");
        if (src && !/^https?:\/\//.test(src)) {
          img.src = APP_ORIGIN + "/" + src.replace(/^\.?\//, "");
        }
      });

      const script = document.createElement("script");
      script.src = APP_ORIGIN + "/script.js?v=" + Date.now();
      document.body.appendChild(script);

      requestAnimationFrame(() => requestAnimationFrame(() => positionHandle(containerEl)));
    });
};

function positionHandle(containerEl) {
  const handle = document.getElementById("tako-drag-handle");
  const outerEl = containerEl.parentElement;
  const anchor = containerEl.querySelector(".anim-layer") || containerEl.querySelector(".widget-wrap");
  if (!handle || !outerEl || !anchor) return;

  const anchorRect = anchor.getBoundingClientRect();
  const outerRect = outerEl.getBoundingClientRect();
  const handleHeight = handle.offsetHeight || 20;
  const handleWidth = handle.offsetWidth || 60;

  handle.style.top = anchorRect.top - outerRect.top - handleHeight - 3 + "px";
  handle.style.left = anchorRect.left - outerRect.left + anchorRect.width / 2 - handleWidth / 2 + "px";
}

export const refreshFrequency = false;

export const className = `
  width: 400px;
  height: 720px;
`;

export const render = () => (
  <div style={{ position: "fixed", width: "400px", height: "720px" }}>
    <div ref={mountApp} style={{ position: "absolute", inset: "0", width: "100%", height: "100%" }} />
    <div
      ref={setupDrag}
      id="tako-drag-handle"
      title="드래그해서 위치 옮기기"
      style={{
        position: "absolute",
        top: "0px",
        left: "0px",
        width: "60px",
        height: "20px",
        borderRadius: "999px",
        background: "rgba(232, 115, 74, 0.9)",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.25)",
        cursor: "grab",
        zIndex: 1000000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: "13px",
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      ⠿⠿
    </div>
  </div>
);
