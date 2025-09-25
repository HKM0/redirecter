const user = "HKM0"; // github user
const repo = "ELTE-IK-BSC"; // repo
const branch = "main"; // branch
const sidebar = document.getElementById("sidebar");
const content = document.getElementById("content");
let currentPath = "";

// github api hivas     
async function loadDir(path = "") {
  currentPath = path;
  const url = `https://api.github.com/repos/${user}/${repo}/contents/${path}?ref=${branch}`;
  const res = await fetch(url);
  const items = await res.json();
  sidebar.innerHTML = "";

  // kenyer nyam nyam
  const breadcrumb = document.createElement("div");
  breadcrumb.className = "breadcrumb";

  const parts = path.split("/").filter(Boolean);
  const rootLink = document.createElement("a");
  rootLink.textContent = "🏠 Gyökér";
  rootLink.onclick = () => loadDir("");
  breadcrumb.appendChild(rootLink);

  // mappak kozotti logika
  if (parts.length > 0) {
    let cumulativePath = "";
    parts.forEach((part, idx) => {
      const separator = document.createElement("span");
      separator.className = "breadcrumb-separator";
      separator.textContent = " / ";
      breadcrumb.appendChild(separator);
      
      if (idx === 0) {
        cumulativePath = part;
      } else {
        cumulativePath += "/" + part;
      }
      
      const link = document.createElement("a");
      link.textContent = part;
      
      // vissza pathok
      const pathForThisLink = cumulativePath;
      link.onclick = () => loadDir(pathForThisLink);
      breadcrumb.appendChild(link);
    });
  }

  sidebar.appendChild(breadcrumb);

  // listazas
  items.forEach(item => {
    const link = document.createElement("a");
    link.className = "sidebar-link";
    link.textContent = (item.type === "dir" ? "📂 " : "📄 ") + item.name;
    link.onclick = () => {
      if (item.type === "dir") {
        loadDir(item.path);
      } else {
        loadFile(item.path);
      }
    };
    sidebar.appendChild(link);
  });
}

// tartalom
async function loadFile(path) {
  const url = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`;
  const ext = path.split(".").pop().toLowerCase();

  // fajlcim
  const fileName = path.split('/').pop();
  let contentHtml = `<h2 class="heading-2" style="margin-bottom: var(--space-lg); color: var(--text-primary);">📄 ${fileName}</h2>`;

  if (ext === "md") {
    const text = await fetch(url).then(r => r.text());
    contentHtml += marked.parse(text);
  } else if (ext === "pdf") {
    const pdfViewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}`;
    const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    
    contentHtml += `
      <div style="position: relative; width: 100%; min-height: calc(100vh - 280px); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border-color);">
        <iframe src="${pdfViewerUrl}" 
                width="100%" 
                height="calc(100vh - 280px)" 
                style="border: none; border-radius: var(--radius-lg); background: var(--secondary-bg);"
                title="PDF Preview: ${fileName}"
                onerror="this.src='${googleViewerUrl}'">
        </iframe>
        <div style="margin-top: var(--space-md); text-align: center; display: flex; gap: var(--space-md); justify-content: center; flex-wrap: wrap;">
          <a href="${url}" target="_blank" class="file-download">📄 Eredeti PDF megnyitása</a>
          <a href="${googleViewerUrl}" target="_blank" class="file-download" style="background: #4285f4;">📖 Google Docs Viewer</a>
        </div>
      </div>
    `;
  } else if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(ext)) {
    contentHtml += `
      <div style="text-align: center; margin: var(--space-lg) 0;">
        <img src="${url}" alt="${fileName}" style="
          max-width: 100%; 
          height: auto; 
          border-radius: var(--radius-lg); 
          border: 1px solid var(--border-color);
          box-shadow: var(--glass-shadow);
          background: var(--secondary-bg);
        " onclick="window.open('${url}', '_blank')" />
        <p style="color: var(--text-muted); font-size: var(--font-size-sm); margin-top: var(--space-sm);">
          Kattints a képre a teljes méretű megjelenítéshez
        </p>
      </div>
    `;
  } else if (["py","java","c","cpp","js","html","css","hs","haskell","json","xml","yml","yaml","cs","csharp"].includes(ext)) {
    const code = await fetch(url).then(r => r.text());
    const language = ext === "hs" || ext === "haskell" ? "haskell" : 
                    ext === "cs" || ext === "csharp" ? "csharp" : ext;
    contentHtml += `<pre><code class="language-${language}">${escapeHtml(code)}</code></pre>`;
    content.innerHTML = contentHtml;
    hljs.highlightAll();
    return;
  } else if (["txt"].includes(ext)) {
    const text = await fetch(url).then(r => r.text());
    contentHtml += `<pre style="background: rgba(255, 255, 255, 0.05); color: var(--text-primary);">${escapeHtml(text)}</pre>`;
  } else {
    contentHtml += `
      <div style="text-align: center; padding: var(--space-3xl);">
        <div style="font-size: 4rem; margin-bottom: var(--space-lg);">📎</div>
        <p style="color: var(--text-secondary); margin-bottom: var(--space-xl);">
          Ez a fájl nem jeleníthető meg közvetlenül a böngészőben.
        </p>
        <a href="${url}" target="_blank" class="file-download">💾 Letöltés: ${fileName}</a>
      </div>
    `;
  }
  
  content.innerHTML = contentHtml;
}

// escape
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// main
loadDir();