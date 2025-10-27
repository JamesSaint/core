// Minimal manual list. Add a line per new page. Order does not matter.
const PAGES = [
  "Finding_My_Kind_26-10-2025.html",
  "Declaration_Stand_in_Truth_2025-10-26.html",
  "Letter_to_Mum_2025-10-26.html",
  "Speaking_into_the_machinery_21-10-2025.html"
];

// Helpers
const isoDate = d => d.toISOString().slice(0,10);
function dateFromName(name) {
  let m = name.match(/(20\d{2})[-_](\d{2})[-_](\d{2})/);
  if (m) return new Date(Date.UTC(+m[1], +m[2]-1, +m[3]));
  m = name.match(/(\d{2})[-_](\d{2})[-_](20\d{2})/);
  if (m) return new Date(Date.UTC(+m[3], +m[2]-1, +m[1]));
  return new Date(0);
}
async function fetchText(url) {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.text();
}
async function titleFromPage(url, fallback) {
  try {
    const html = await fetchText(url);
    const doc = new DOMParser().parseFromString(html, "text/html");
    const h1 = doc.querySelector("h1");
    const title = doc.querySelector("title");
    let t = (h1 && h1.textContent.trim()) || (title && title.textContent.trim()) || fallback;
    return t.replace(/\s+/g, " ");
  } catch {
    return fallback;
  }
}

async function build() {
  // Build objects
  const entries = await Promise.all(PAGES.map(async name => {
    const url = `./${encodeURIComponent(name)}`;
    const dt  = dateFromName(name);
    const fallback = name.replace(/[-_]/g, " ").replace(/\.html?$/i, "");
    const title = await titleFromPage(url, fallback);
    return { url, title, dt };
  }));

  // Sort newest first
  entries.sort((a,b) => b.dt - a.dt);

  // Render
  const tbody = document.getElementById("core-body");
  tbody.innerHTML = entries.map(e => `
    <tr>
      <td>${e.dt.getTime() ? isoDate(e.dt) : ""}</td>
      <td><a href="${e.url}">${e.title}</a></td>
    </tr>
  `).join("");

  // Footer year
  const yEl = document.getElementById("copy-year");
  if (yEl) yEl.textContent = new Date().getFullYear();
}

build();
