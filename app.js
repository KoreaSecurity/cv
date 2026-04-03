const targets = document.querySelectorAll("[data-md]");
const summaryTarget = document.querySelector("[data-auto-summary]");
const pretextPanel = document.querySelector("[data-pretext-panel]");

function extractEntryId(text) {
  const match = text.match(/^\[([^\]]+)\]\s*/);
  return match ? match[1] : "";
}

function removeEntryId(text) {
  return text.replace(/^\[[^\]]+\]\s*/, "");
}

function extractQuotedTitle(text) {
  const match = text.match(/[“"]([^”"]+)[”"]/);
  return match ? match[1] : "";
}

function extractDate(text) {
  const patterns = [
    /\b\d{4}\.\d{2}\.\d{2}\b/g,
    /\b[A-Z][a-z]{2}\s\d{4}\b/g,
    /\b\d{4}\b/g,
  ];

  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length) {
      return matches[matches.length - 1][0];
    }
  }

  return "";
}

function entryKindFromId(id, text) {
  if (id.startsWith("CVE")) return "cve";
  if (id.startsWith("J")) return "journal";
  if (id.startsWith("IC") || id.startsWith("DC")) return "conference";
  if (id.startsWith("A")) return "award";
  if (id.startsWith("P")) return "patent";
  if (id.startsWith("PJ")) return "project";
  if (id.startsWith("SW")) return "software";
  if (/vulnerability|CVE/i.test(text)) return "cve";
  return "default";
}

function iconSvg(kind) {
  const icons = {
    cve: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5c0 4.5 2.9 8.6 7 10 4.1-1.4 7-5.5 7-10V6l-7-3Zm0 3.2 4 1.7V11c0 2.9-1.7 5.6-4 6.8-2.3-1.2-4-3.9-4-6.8V7.9l4-1.7Z"/></svg>',
    journal: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h9a3 3 0 0 1 3 3v13H9a3 3 0 0 0-3 0V4Zm2 2v9h8V7a1 1 0 0 0-1-1H8Zm1 11h9"/></svg>',
    conference: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v10H4V5Zm2 2v6h12V7H6Zm2 10h8v2H8z"/></svg>',
    award: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10v3a5 5 0 1 1-10 0V4Zm-2 1h2v2a3 3 0 0 1-2 2.8V5Zm14 0h2v4.8A3 3 0 0 1 19 7V5Zm-8 12h2v3h3v2H8v-2h3v-3Z"/></svg>',
    patent: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a6 6 0 0 1 4.5 10l-1 1.2V16H8.5v-2.8l-1-1.2A6 6 0 0 1 12 2Zm-2 16h4v1a2 2 0 1 1-4 0v-1Z"/></svg>',
    project: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h8v5H3V6Zm10 0h8v5h-8V6ZM3 13h8v5H3v-5Zm10 3h8v2h-8v-2Zm0-3h8v2h-8v-2Z"/></svg>',
    software: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v12H4V5Zm2 2v8h12V7H6Zm3 12h6v2H9z"/></svg>',
    default: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5"/></svg>',
  };

  return icons[kind] || icons.default;
}

function profileLinkKind(link) {
  const href = link.getAttribute("href") || "";
  const label = link.textContent.trim().toLowerCase();

  if (href.startsWith("mailto:") || label.includes("email")) return "email";
  if (href.includes("scholar.google")) return "scholar";
  if (href.includes("orcid.org")) return "orcid";
  if (href.includes("github.com")) return "github";
  return "link";
}

function profileIconSvg(kind) {
  const icons = {
    email: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4z"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    scholar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 4 9 5-9 5-9-5 9-5Z"/><path d="M7 11v4c0 1.8 2.2 3 5 3s5-1.2 5-3v-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    orcid: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="8.1" cy="8" r="1.15"/><path d="M8.1 10.7v5.4M11.2 10.7v5.4M11.2 10.7h3.1a2.7 2.7 0 0 1 0 5.4h-3.1" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-2.85 17.54c.45.08.61-.2.61-.44v-1.54c-2.49.54-3.01-1.06-3.01-1.06-.4-1.03-1-1.3-1-1.3-.82-.55.06-.54.06-.54.91.06 1.39.93 1.39.93.8 1.37 2.1.97 2.61.74.08-.58.31-.97.56-1.2-1.99-.23-4.08-1-4.08-4.44 0-.98.35-1.79.93-2.42-.1-.23-.4-1.15.09-2.39 0 0 .76-.24 2.49.92a8.6 8.6 0 0 1 4.54 0c1.73-1.16 2.49-.92 2.49-.92.49 1.24.19 2.16.1 2.39.58.63.93 1.44.93 2.42 0 3.45-2.1 4.21-4.1 4.44.32.28.6.83.6 1.67v2.47c0 .24.16.52.61.44A9 9 0 0 0 12 3Z"/></svg>',
    link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14 14 10M8.5 15.5l-2 2a3 3 0 1 1-4.2-4.2l2-2M15.5 8.5l2-2a3 3 0 1 1 4.2 4.2l-2 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  };

  return icons[kind] || icons.link;
}

function buildRichCard(li) {
  const rawText = li.textContent.trim();
  const id = extractEntryId(rawText);
  const text = removeEntryId(rawText);
  const quotedTitle = extractQuotedTitle(text);
  const date = extractDate(text);
  const kind = entryKindFromId(id, text);

  let title = quotedTitle;
  if (!title) {
    const firstChunk = text.split(",")[0]?.trim() || text;
    title = firstChunk;
  }

  let detail = text;
  if (quotedTitle) {
    detail = text.replace(/[“"][^”"]+[”"]/, "").replace(/\s+,/g, ",").trim();
  } else if (title) {
    detail = text.replace(title, "").replace(/^,\s*/, "").trim();
  }

  const card = document.createElement("article");
  card.className = "entry-card";

  const top = document.createElement("div");
  top.className = "entry-top";

  const left = document.createElement("div");
  left.className = "entry-left";

  const icon = document.createElement("span");
  icon.className = `entry-icon entry-icon-${kind}`;
  icon.innerHTML = iconSvg(kind);
  left.appendChild(icon);

  if (id) {
    const badge = document.createElement("span");
    badge.className = "entry-badge";
    badge.textContent = id;
    left.appendChild(badge);
  }

  top.appendChild(left);

  if (date) {
    const meta = document.createElement("span");
    meta.className = "entry-date";
    meta.textContent = date;
    top.appendChild(meta);
  }

  const titleEl = document.createElement("h3");
  titleEl.className = "entry-title";
  titleEl.textContent = title;

  const detailEl = document.createElement("p");
  detailEl.className = "entry-detail";
  detailEl.textContent = detail || text;

  const detailText = (detail || text).trim();
  const hasDetail = detailText.length > 0;

  if (hasDetail) {
    const disclosure = document.createElement("details");
    disclosure.className = "entry-disclosure";

    const summary = document.createElement("summary");
    summary.className = "entry-summary";
    summary.textContent = "Details";

    disclosure.append(summary, detailEl);
    card.append(top, titleEl, disclosure);
  } else {
    card.append(top, titleEl, detailEl);
  }

  return card;
}

function enhanceLongLists(root) {
  root.querySelectorAll(".long-list li").forEach((li) => {
    const card = buildRichCard(li);
    li.innerHTML = "";
    li.appendChild(card);
  });
}

function enhanceProfileLinks() {
  document.querySelectorAll(".profile-info a").forEach((link) => {
    if (link.querySelector(".profile-link-icon")) return;
    const kind = profileLinkKind(link);
    const label = link.textContent.trim();
    link.classList.add("profile-link");
    link.setAttribute("aria-label", label);
    link.setAttribute("title", label);
    link.innerHTML = `<span class="profile-link-icon profile-link-icon-${kind}">${profileIconSvg(kind)}</span><span class="sr-only">${label}</span>`;
  });
}

function buildSectionToggleButton() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "section-toggle";
  button.setAttribute("aria-expanded", "true");
  button.innerHTML =
    '<span class="section-toggle-icon" aria-hidden="true">-</span><span class="section-toggle-label">Hide items</span>';
  return button;
}

function enhanceSectionToggles() {
  document.querySelectorAll(".section, .subpage-main").forEach((container) => {
    const list = container.querySelector(".long-list");
    const header = container.querySelector(".section-heading, .page-title");
    if (!list || !header || header.querySelector(".section-toggle")) return;

    const title = header.querySelector("h2, h1");
    if (!title) return;

    let bar = header.querySelector(".section-header-bar");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "section-header-bar";
      header.insertBefore(bar, header.firstChild);
      bar.appendChild(title);
    }

    const button = buildSectionToggleButton();
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", expanded ? "false" : "true");
      button.querySelector(".section-toggle-icon").textContent = expanded ? "+" : "-";
      button.querySelector(".section-toggle-label").textContent = expanded
        ? "Show items"
        : "Hide items";
      list.hidden = expanded;
    });

    bar.appendChild(button);
  });
}

function decorateSectionTitles() {
  document.querySelectorAll(".section-heading h2, .page-title h1").forEach((el) => {
    if (el.querySelector(".title-icon")) return;
    const icon = document.createElement("span");
    icon.className = "title-icon";
    icon.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg>';
    el.prepend(icon);
  });
}

async function renderMarkdown(target) {
  const path = target.dataset.md;

  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}`);
    }

    const markdown = await response.text();
    target.innerHTML = marked.parse(markdown);
    enhanceLongLists(target);
  } catch (error) {
    target.innerHTML = `<p class="md-error">${path} 파일을 불러오지 못했습니다.</p>`;
    console.error(error);
  }
}

async function countMarkdownItems(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }

  const text = await response.text();
  return text
    .split("\n")
    .filter((line) => line.trim().startsWith("- ")).length;
}

async function renderAutoSummary() {
  if (!summaryTarget) return;

  try {
    const [
      cves,
      awards,
      intlJournal,
      domJournal,
      intlConf,
      domConf,
      software,
      patents,
    ] = await Promise.all([
      countMarkdownItems("./content/cves.md"),
      countMarkdownItems("./content/awards.md"),
      countMarkdownItems("./content/international-journal.md"),
      countMarkdownItems("./content/domestic-journal.md"),
      countMarkdownItems("./content/international-conference.md"),
      countMarkdownItems("./content/domestic-conference.md"),
      countMarkdownItems("./content/software-registration.md"),
      countMarkdownItems("./content/patents.md"),
    ]);

    const stats = [
      ["Public CVEs", cves],
      ["Awards and Honors", awards],
      ["Journal Papers", intlJournal + domJournal],
      ["Conference Papers", intlConf + domConf],
      ["Software Registrations", software],
      ["Patents", patents],
    ];

    summaryTarget.innerHTML = `
      <ul>
        ${stats
          .map(
            ([label, value]) => `
              <li>
                <p>${label}</p>
                <strong>${value}</strong>
              </li>
            `
          )
          .join("")}
      </ul>
    `;
  } catch (error) {
    summaryTarget.innerHTML = `<p class="md-error">Summary could not be loaded.</p>`;
    console.error(error);
  }
}

function getCanvasFont(element) {
  const style = window.getComputedStyle(element);
  const fontStyle = style.fontStyle || "normal";
  const fontVariant = style.fontVariant || "normal";
  const fontWeight = style.fontWeight || "400";
  const fontSize = style.fontSize || "16px";
  const fontFamily = style.fontFamily || '"Noto Sans KR", sans-serif';
  return `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize} ${fontFamily}`;
}

function parseRecentHighlights(markdown) {
  return markdown
    .trim()
    .split(/\n\s*\n/g)
    .map((block) => {
      const item = {};
      block.split("\n").forEach((line) => {
        const [key, ...rest] = line.split(":");
        if (!key || !rest.length) return;
        item[key.trim().toLowerCase()] = rest.join(":").trim();
      });
      return item;
    })
    .filter((item) => item.type && item.title);
}

function renderPretextFallback(panel) {
  const linesRoot = panel.querySelector("[data-pretext-lines]");
  const label = panel.querySelector("[data-pretext-label]");
  const status = panel.querySelector("[data-pretext-status]");
  const scene = {
    type: "Highlight",
    date: "",
    title: "Recent highlights could not be loaded.",
    detail: "Static fallback mode.",
  };

  linesRoot.innerHTML = `
    <p class="pretext-meta">${scene.type}</p>
    <p class="pretext-title-line">${scene.title}</p>
    <p class="pretext-line">${scene.detail}</p>
  `;
  label.textContent = "Recent Highlight";
  status.textContent = scene.detail;
}

async function initPretextDemo() {
  if (!pretextPanel) return;

  const linesRoot = pretextPanel.querySelector("[data-pretext-lines]");
  const label = pretextPanel.querySelector("[data-pretext-label]");
  const status = pretextPanel.querySelector("[data-pretext-status]");

  try {
    const highlightResponse = await fetch("./content/recent-highlights.md");
    if (!highlightResponse.ok) {
      throw new Error("Failed to load recent-highlights.md");
    }

    const highlightMarkdown = await highlightResponse.text();
    const scenes = parseRecentHighlights(highlightMarkdown);
    if (!scenes.length) {
      throw new Error("No recent highlight scenes found");
    }

    const { prepareWithSegments, layoutWithLines } = await import(
      "https://esm.sh/@chenglou/pretext?bundle"
    );

    const preparedScenes = new Map();
    let currentIndex = 0;

    function prepareScene(scene) {
      const font = getCanvasFont(linesRoot);
      const cacheKey = `${scene.type}:${scene.date}:${scene.title}:${font}`;
      if (!preparedScenes.has(cacheKey)) {
        preparedScenes.set(cacheKey, {
          title: prepareWithSegments(scene.title, font),
          detail: prepareWithSegments(scene.detail || "", font),
        });
      }
      return preparedScenes.get(cacheKey);
    }

    function renderScene(index) {
      const width = Math.max(linesRoot.clientWidth, 240);
      const style = window.getComputedStyle(linesRoot);
      const lineHeight = Number.parseFloat(style.lineHeight) || 26;
      const scene = scenes[index];
      const prepared = prepareScene(scene);
      const titleLayout = layoutWithLines(prepared.title, width, lineHeight);
      const detailLayout = layoutWithLines(prepared.detail, width, lineHeight);
      const titleLines = titleLayout.lines
        .map(
          (line, lineIndex) =>
            `<p class="pretext-title-line" style="transition-delay:${lineIndex * 45}ms">${line.text}</p>`
        )
        .join("");
      const detailLines = detailLayout.lines
        .map(
          (line, lineIndex) =>
            `<p class="pretext-line" style="transition-delay:${120 + lineIndex * 45}ms">${line.text}</p>`
        )
        .join("");

      linesRoot.innerHTML = `
        <div class="pretext-topline">
          <p class="pretext-meta">${scene.type}</p>
          <span class="pretext-date">${scene.date || ""}</span>
        </div>
        ${titleLines}
        ${detailLines}
      `;

      label.textContent = scene.type;
      status.textContent = `${index + 1} / ${scenes.length}`;
    }

    renderScene(currentIndex);

    const resizeObserver = new ResizeObserver(() => {
      preparedScenes.clear();
      renderScene(currentIndex);
    });
    resizeObserver.observe(linesRoot);

    window.setInterval(() => {
      currentIndex = (currentIndex + 1) % scenes.length;
      renderScene(currentIndex);
    }, 3200);
  } catch (error) {
    console.error(error);
    renderPretextFallback(pretextPanel);
  }
}

Promise.all([...targets].map(renderMarkdown)).then(() => {
  enhanceProfileLinks();
  decorateSectionTitles();
  enhanceSectionToggles();
  renderAutoSummary();
  initPretextDemo();
});
