// VERSION: rock-solid (no fetches, no APIs)

// Update this list when you add a page.
// Order doesn't matter; code sorts by any date in the filename.
const PAGES = [
  "Finding_My_Kind_26-10-2025.html",
  "Declaration_Stand_in_Truth_2025-10-26.html",
  "Letter_to_Mum_2025-10-26.html",
  "Speaking_into_the_machinery_21-10-2025.html",
  "Reparenting_Transmission_09-10-2025.html"
];

// --- helpers ---
function isoDate(d) { return d.toISOString().slice(0,10); }
function dateFromName(name) {
  let m = name.match(/(20\d{2})[-_](\d{2})[-_](\d{2})/);            // 2025-10-26
  if (m) return new Date(Date.UTC(+m[1], +m[2]-1, +m[3]));
  m = name.match(/(\d{2})[-_](\d{2})[-_](20\d{2})/);                // 26-10-2025
  if (m) return new Date(Date.UTC(+m[3], +m[2]-1, +m[1]));
  return new Date(0);
}
function prettyFromName(name) {
  return name
    .replace(/\.html?$/i, "")             // remove .html
    .replace(/[-_]/g, " ")                // turn - and _ into spaces
    .replace(/\b20\d{2}\b/g, "")          // remove 4-digit years
    .replace(/\b\d{1,2}\s?\d{1,2}\b/g, "")// remove DD MM
    .replace(/\s{2,}/g, " ")              // collapse double spaces
    .trim()
    .replace(/\b([a-z])/g, s => s.toUpperCase()); // capitalise words
}


// --- main ---
function buildIndex() {
  const tbody = document.getElementById("core-body");
  if (!tbody) return;

  const entries = PAGES.map(name => {
    return {
      url: `./${encodeURIComponent(name)}`,
      title: prettyFromName(name),
      dt: dateFromName(name)
    };
  }).sort((a,b) => b.dt - a.dt);

  tbody.innerHTML = entries.length
    ? entries.map(e => `
        <tr>
          <td>${e.dt.getTime() ? isoDate(e.dt) : ""}</td>
          <td><a href="${e.url}">${e.title}</a></td>
        </tr>
      `).join("")
    : `<tr><td colspan="2">No entries.</td></tr>`;

  const yEl = document.getElementById("copy-year");
  if (yEl) yEl.textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", buildIndex);
