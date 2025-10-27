// ---- Config you might change (owner/repo). Leave blank to auto-detect branch. ----
const GH_OWNER  = "jamessaint";
const GH_REPO   = "jamessaint.github.io";

// Helpers
const isoDate = d => d.toISOString().slice(0,10);
const dateFromFilename = name => {
  let m = name.match(/(20\d{2})[-_](\d{2})[-_](\d{2})/);
  if (m) return new Date(Date.UTC(+m[1], +m[2]-1, +m[3]));
  m = name.match(/(\d{2})[-_](\d{2})[-_](20\d{2})/);
  if (m) return new Date(Date.UTC(+m[3], +m[2]-1, +m[1]));
  return null;
};
async function fetchJSON(url) {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  return r.json();
}
async function fetchText(url) {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  return r.text();
}
async function titleFromPage(url) {
  try {
    const html = await fetchText(url);
    const doc = new DOMParser().parseFromString(html, "text/html");
    const h1 = doc.querySelector("h1");
    const title = doc.querySelector("title");
    let t = (h1 && h1.textContent.trim()) || (title && title.textContent.trim());
    if (!t) t = url.split("/").pop().replace(/[-_]/g, " ");
    return t.replace(/\s+/g, " ");
  } catch {
    return url.split("/").pop().replace(/[-_]/g, " ");
  }
}

// Detect default branch, then list /core
async function detectBranch() {
  // Try the repo metadata first
  try {
    const meta = await fetchJSON(`https://api.github.com/repos/${GH_OWNER}/${GH_REPO}`);
    if (meta && meta.default_branch) return meta.default_branch;
  } catch {
    // fall through to guesses
  }
  // Try common branches until one resolves
  const guesses = ["main", "master", "gh-pages"];
  for (const guess of guesses) {
    try {
      const url = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/core?ref=${guess}`;
      const r = await fetch(url, { cache: "no-store" });
      if (r.ok) return guess;
    } catch {}
  }
  // Last resort
  return "main";
}

async function listCoreFiles(branch) {
  const url = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/core?ref=${branch}`;
  const items = await fetchJSON(url);
  return items.filter(x =>
    x.type === "file" &&
    /\.html$/i.test(x.name) &&
    !/^index\.html$/i.test(x.name)
  );
}

async function build() {
  const tbody   = document.getElementById("core-body");
  const loading = document.getElementById("loading-row");

  try {
    const branch = await detectBranch();
    const files = await listCoreFiles(branch);

    const entries = await Promise.all(files.map(async f => {
      const url = `https://${GH_OWNER}.github.io/core/${encodeURIComponent(f.name)}`;
      const dt = dateFromFilename(f.name) || new Date(0);
      const title = await titleFromPage(url);
      return { url, title, dt };
    }));

    entries.sort((a, b) => b.dt - a.dt);

    tbody.innerHTML = entries.map(e => `
      <tr>
        <td class="date">${isNaN(e.dt) ? "" : isoDate(e.dt)}</td>
        <td class="title"><a href="${e.url}">${e.title}</a></td>
      </tr>
    `).join("") || `<tr><td colspan="2">No entries found in /core.</td></tr>`;
  } catch (err) {
    const msg = String(err.message || err);
    const hint = /HTTP 404/.test(msg)
      ? "Check that the repository name and /core/ folder exist, and that the repo is public."
      : /rate limit/i.test(msg)
      ? "GitHub API rate limit hit. Try again shortly."
      : "";
    tbody.innerHTML = `<tr><td colspan="2">Could not build index. ${msg}${hint ? " — " + hint : ""}</td></tr>`;
  } finally {
    if (loading) loading.remove();
    const y = new Date().getFullYear();
    const el = document.getElementById("copy-year");
    if (el) el.textContent = y;
  }
}

build();
