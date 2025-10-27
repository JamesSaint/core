// VERSION: bulletproof (no fetches)
// Update this list when you add a page.
const PAGES = [
  "Finding_My_Kind_26-10-2025.html",
  "Declaration_Stand_in_Truth_2025-10-26.html",
  "Letter_to_Mum_2025-10-26.html",
  "Speaking_into_the_machinery_21-10-2025.html",
  "Reparenting_Transmission.html"
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
function prettyFromName(name) {
  return name
    .replace(/\.html?$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\b([a-z])/g, s => s.toUpperCase());
}

function build() {
  const entries = PAGES.map(name => {
    const url = `./${encodeURIComponent(name)}`;
    const dt  = dateFromName(name);
    const title = prettyFromName(name);
    return { url, title, dt };
  }).sort((a,b) => b.dt - a.dt);

  const tbody = document.getElementById("core-body");
  tbody.innerHTML = entries.map(e => `
    <tr>
      <td>${e.dt.getTime() ? isoDate(e.dt) : ""}</td>
      <td><a href="${e.url}">${e.title}</a></td>
    </tr>
  `).join("");

  const yEl = document.getElementById("copy-year");
  if (yEl) yEl.textContent = new Date().getFullYear();
}
build();
