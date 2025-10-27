// Config: update owner/repo/branch if needed
const GH_OWNER = "jamessaint";
const GH_REPO  = "jamessaint.github.io";
const GH_BRANCH = "main"; // or "master" if applicable

function isoDate(d) { return d.toISOString().slice(0,10); }

function dateFromFilename(name) {
  // 2025-10-26 or 2025_10_26
  let m = name.match(/(20\d{2})[-_](\d{2})[-_](\d{2})/);
  if (m) return new Date(Date.UTC(+m[1], +m[2]-1, +m[3]));
  // 26-10-2025 or 26_10_2025
  m = name.match(/(\d{2})[-_](\d{2})[-_](20\d{2})/);
  if (m) return new Date(Date.UTC(+m[3], +m[2]-1, +m[1]));
  return null;
}

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

async function build() {
  const tbody = document.getElementById("core-body");
  const loading = document.getElementById("loading-row");
  try {
    // GitHub API: list contents of /core
    const api = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/core?ref=${GH_BRANCH}`;
    const items = await fetchJSON(api);

    // Filter for .html files, excluding index.html
    const files = items.filter(x =>
      x.type === "file" &&
      /\.html$/i.test(x.name) &&
      !/^index\.html$/i.test(x.name)
    );

    // Build entries with filesystem URL, not the raw content URL
    // Your site serves them at https://jamessaint.github.io/core/<name>
    const entries = await Promise.all(files.map(async f => {
      const url = `https://${GH_OWNER}.github.io/core/${encodeURIComponent(f.name)}`;
      const dt = dateFromFilename(f.name) || (f.sha ? new Date(0) : new Date(0));
      const title = await titleFromPage(url);
      return { url, title, dt };
    }));

    // Sort newest first (by filename date; if no date found, they sink to bottom)
    entries.sort((a,b) => b.dt - a.dt);

    // Render rows
    const rows = entries.map(e => `
      <tr>
        <td class="date">${isNaN(e.dt) ? "" : isoDate(e.dt)}</td>
        <td class="title"><a href="${e.url}">${e.title}</a></td>
      </tr>
    `).join("");

    // Update table
    tbody.innerHTML = rows || `<tr><td colspan="2">No entries found.</td></tr>`;

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="2">Could not build index. ${String(err.message || err)}</td></tr>`;
  } finally {
    if (loading) loading.remove();
    // footer year
    const y = new Date().getFullYear();
    const el = document.getElementById("copy-year");
    if (el) el.textContent = y;
  }
}

// Kick off
build();
