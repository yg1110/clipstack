let allHistory = [];
let filtered = [];
let selectedIndex = 0;

window.clipboardAPI.onHistoryUpdate((data) => {
  allHistory = data;
  filtered = data;
  selectedIndex = 0;
  render();
});

function render() {
  const list = document.getElementById("list");
  const empty = document.getElementById("empty");

  if (filtered.length === 0) {
    empty.style.display = "block";
    list.innerHTML = "";
    return;
  }

  empty.style.display = "none";
  list.innerHTML = filtered
    .map(
      (text, i) => `
    <div class="item ${i === selectedIndex ? "selected" : ""}"
         onclick="copyByIndex(${i})">
      <span class="idx">${i + 1}</span>
      <span class="item-text">${escapeHtml(text)}</span>
      <button class="delete-btn" onclick="deleteItem(event, ${i})" title="삭제">✕</button>
    </div>
  `,
    )
    .join("");

  list.querySelector(".selected")?.scrollIntoView({ block: "nearest" });
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function copyByIndex(i) {
  window.clipboardAPI.copyItem(filtered[i]);
}

function deleteItem(e, i) {
  e.stopPropagation(); // 클릭 이벤트가 아이템으로 전파되지 않게
  window.clipboardAPI.deleteItem(filtered[i]);
}

document.getElementById("search").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  filtered = allHistory.filter((t) => t.toLowerCase().includes(q));
  selectedIndex = 0;
  render();
});

document.getElementById("close-btn").addEventListener("click", () => {
  window.clipboardAPI.hideWindow();
});

document.getElementById("clear-btn").addEventListener("click", () => {
  window.clipboardAPI.clearHistory();
  allHistory = [];
  filtered = [];
  selectedIndex = 0;
  render();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    selectedIndex = Math.min(selectedIndex + 1, filtered.length - 1);
    render();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    selectedIndex = Math.max(selectedIndex - 1, 0);
    render();
  } else if (e.key === "Enter") {
    if (filtered[selectedIndex]) copyByIndex(selectedIndex);
  } else if (e.key === "Escape") {
    window.clipboardAPI.copyItem(null);
  }
});
