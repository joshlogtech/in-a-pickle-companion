(function () {
  const app = document.getElementById("app");

  const WORDS = RAW.map(r => {
    const p = r.split("|");
    return { en: p[0], tr: p.slice(1) };
  }).sort((a, b) => a.en.localeCompare(b.en, "en"));

  const byLetter = {};
  WORDS.forEach(w => {
    const L = w.en[0].toUpperCase();
    (byLetter[L] = byLetter[L] || []).push(w);
  });
  const LETTERS = Object.keys(byLetter).sort();

  const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const cardHTML = (w, i) =>
    `<article class="card c${i % 3}"><h3>${esc(w.en)}</h3><div class="chips">` +
    w.tr.map(t => `<span class="chip">${esc(t)}</span>`).join("") +
    `</div></article>`;

  function welcome() {
    app.innerHTML = `
      <section class="welcome">
        <div>
          <h1>In a<span>Pickle</span></h1>
          <p>Diccionario del juego: busca cada palabra y mira sus traducciones al español.</p>
          <div class="dots"><i></i><i></i><i></i></div>
        </div>
        <button class="start" id="go">Empezar</button>
      </section>`;
    document.getElementById("go").onclick = () => (location.hash = "#/letras");
    document.title = "In a Pickle · Diccionario";
  }

  function letters() {
    app.innerHTML = `
      <header class="bar">
        <button class="back" aria-label="Volver al inicio" id="home">‹</button>
        <h2>Elige una letra</h2>
      </header>
      <div class="search"><input id="q" type="search" placeholder="Buscar palabra (inglés o español)" autocomplete="off" aria-label="Buscar palabra"></div>
      <div id="out"></div>`;
    document.getElementById("home").onclick = () => (location.hash = "");
    const out = document.getElementById("out");

    const grid = () => {
      out.innerHTML = `<nav class="grid">` + LETTERS.map((L, i) =>
        `<button class="tile c${i % 3}" data-l="${L}" aria-label="Letra ${L}, ${byLetter[L].length} palabras">${L}<small>${byLetter[L].length}</small></button>`
      ).join("") + `</nav>`;
      out.querySelectorAll(".tile").forEach(b => (b.onclick = () => (location.hash = "#/letra/" + b.dataset.l)));
    };
    grid();

    document.getElementById("q").addEventListener("input", e => {
      const q = norm(e.target.value.trim());
      if (!q) return grid();
      const hits = WORDS.filter(w => norm(w.en).includes(q) || w.tr.some(t => norm(t).includes(q)));
      out.innerHTML = hits.length
        ? `<p class="hint">${hits.length} resultado${hits.length === 1 ? "" : "s"}</p><div class="list">${hits.map(cardHTML).join("")}</div>`
        : `<p class="empty">No encontramos "${esc(e.target.value)}". Prueba con otra palabra.</p>`;
    });
  }

  function list(L) {
    const words = byLetter[L];
    if (!words) return (location.hash = "#/letras");
    const color = ["var(--green)", "var(--blue)", "var(--red)"][LETTERS.indexOf(L) % 3];
    app.innerHTML = `
      <header class="bar">
        <button class="back" aria-label="Volver a las letras" id="back">‹</button>
        <h2>Palabras con ${L}</h2>
        <div class="badge" style="background:${color}">${L}</div>
      </header>
      <div class="list">${words.map(cardHTML).join("")}</div>`;
    document.getElementById("back").onclick = () => (location.hash = "#/letras");
    window.scrollTo(0, 0);
    document.title = "Letra " + L + " · In a Pickle";
  }

  function route() {
    const h = location.hash;
    if (h.startsWith("#/letra/")) list(decodeURIComponent(h.slice(8)).toUpperCase());
    else if (h === "#/letras") { letters(); window.scrollTo(0, 0); }
    else welcome();
  }

  window.addEventListener("hashchange", route);
  route();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
