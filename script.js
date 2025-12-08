async function carregarPortfolio() {
    const req = await fetch("dados.json");
    const dados = await req.json();

    const container = document.getElementById("portfolio");

    dados.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("item", item.tipo);

        let htmlMidia = "";

        /* ============================================================
           VÍDEO
        ============================================================ */
        if (item.tipo === "video") {
            htmlMidia = `<video src="${item.arquivo}" controls></video>`;
        }

        /* ============================================================
           CARROSSEL (ARRASTÁVEL)
        ============================================================ */
        else if (item.tipo === "carrossel") {
            htmlMidia = `
                <div class="carrossel-container draggable">
                    <div class="carrossel">
                        ${item.arquivos.map(img => `<img src="${img}">`).join("")}
                    </div>
                </div>
            `;
        }

        /* ============================================================
           SLIDE (BOTÕES)
        ============================================================ */
        else if (item.tipo === "slide") {
            htmlMidia = `
                <div class="carrossel-container slide-mode">
                    <div class="carrossel">
                        ${item.arquivos.map(img => `<img src="${img}">`).join("")}
                    </div>

                    <button class="btn-prev">❮</button>
                    <button class="btn-next">❯</button>
                </div>
            `;
        }

        /* ============================================================
           FEED, STORY, A4 (1 imagem)
        ============================================================ */
        else {
            htmlMidia = `<img src="${item.arquivo}" alt="">`;
        }

        /* ============================================================
           TEMPLATE DO ITEM
        ============================================================ */
        div.innerHTML = `
            ${htmlMidia}

            <div class="texto">
                <h3>${item.titulo || ""}</h3>
                <p>${item.descricao || ""}</p>
            </div>
        `;

        container.appendChild(div);

        setTimeout(() => div.classList.add("show"), 50);
    });

    inicializarSlides();
    inicializarArraste();
}

/* ============================================================
   SLIDES COM BOTÕES (APENAS TIPO: slide)
============================================================ */
function inicializarSlides() {
    document.querySelectorAll(".slide-mode").forEach(box => {
        const carrossel = box.querySelector(".carrossel");
        const imagens = carrossel.querySelectorAll("img");
        let pos = 0;

        const prev = box.querySelector(".btn-prev");
        const next = box.querySelector(".btn-next");

        next.onclick = () => {
            pos = (pos + 1) % imagens.length;
            carrossel.style.transform = `translateX(-${pos * 100}%)`;
        };

        prev.onclick = () => {
            pos = (pos - 1 + imagens.length) % imagens.length;
            carrossel.style.transform = `translateX(-${pos * 100}%)`;
        };
    });
}

/* ============================================================
   CARROSSEL COM ARRASTE (story/feed/carrossel)
============================================================ */
function inicializarArraste() {
    document.querySelectorAll(".carrossel-container.draggable").forEach(container => {
        const track = container.querySelector(".carrossel");
        if (!track) return; // prevenção caso não exista

        const slides = Array.from(track.querySelectorAll("img"));
        if (slides.length === 0) return;

        let isDown = false;
        let startX = 0;
        let scrollStart = 0;
        let activePointerId = null;

        // Função utilitária para obter largura de "slide" usada no snap.
        function getSlideWidth() {
            // Prioriza largura do primeiro slide; fallback para largura do container
            const first = slides[0];
            const rect = first.getBoundingClientRect();
            const w = rect.width;
            return (w && w > 0) ? w : container.clientWidth || 1;
        }

        // Pointer down (mouse/touch unificados)
        container.addEventListener("pointerdown", (e) => {
            // Somente botão primário do mouse ou toque
            if (e.pointerType === "mouse" && e.button !== 0) return;
            isDown = true;
            activePointerId = e.pointerId;
            startX = e.clientX;
            scrollStart = container.scrollLeft;
            container.classList.add("dragging");
            try { container.setPointerCapture(e.pointerId); } catch (err) { /* ignora em ambientes que não suportam */ }
        });

        // Pointer move
        container.addEventListener("pointermove", (e) => {
            if (!isDown || e.pointerId !== activePointerId) return;
            const walk = e.clientX - startX;
            container.scrollLeft = scrollStart - walk;
        });

        // End / cancel
        function endDrag(e) {
            if (!isDown || (e && e.pointerId !== activePointerId)) return;
            isDown = false;
            activePointerId = null;
            container.classList.remove("dragging");
            try { container.releasePointerCapture && container.releasePointerCapture(e.pointerId); } catch (err) {}
            snapToClosest(container, slides);
        }

        container.addEventListener("pointerup", endDrag);
        container.addEventListener("pointercancel", endDrag);
        container.addEventListener("pointerleave", endDrag);
    });

    function snapToClosest(container, slides) {
        if (!container || !slides || slides.length === 0) return;

        const slideWidth = (function() {
            const first = slides[0];
            const rect = first.getBoundingClientRect();
            return (rect && rect.width > 0) ? rect.width : container.clientWidth || 1;
        })();

        // evita divisão por zero
        const index = Math.round(container.scrollLeft / slideWidth);
        const left = Math.max(0, index * slideWidth);

        container.scrollTo({
            left,
            behavior: "smooth"
        });
    }
}



/* ============================================================
   INICIAR SISTEMA
============================================================ */
carregarPortfolio();


const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const dots = [];
const DOTS_QTD = 60;
const MAX_DISTANCE = 150;

for (let i = 0; i < DOTS_QTD; i++) {
    dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // pontos
    ctx.fillStyle = "rgba(180,180,180,0.8)";
    dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
    });

    // linhas conectando pontos próximos
    ctx.strokeStyle = "rgba(150,150,150,0.4)";
    dots.forEach((a, i) => {
        dots.slice(i + 1).forEach(b => {
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            if (dist < MAX_DISTANCE) {
                ctx.lineWidth = 1 - dist / MAX_DISTANCE;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }
        });
    });

    // movimento
    dots.forEach(dot => {
        dot.x += dot.vx;
        dot.y += dot.vy;

        if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;
    });

    requestAnimationFrame(draw);
}

draw();

/* ---------- TYPING EFFECT ---------- 
   words = array de frases/roles que aparecem em loop
   speed: typing speed in ms per char
*/
(function typingEffect(){
  const el = document.getElementById('typed');
  if (!el) return;

  const words = [
    "Photoshop • Illustrator",
    "Design para redes sociais",
    "Carrosséis, Banners",
    "Identidade visual e logos"
  ];
  const typingSpeed = 45;
  const pauseBetween = 1400;

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function tick(){
    const current = words[wordIndex];
    if (!isDeleting){
      el.textContent = current.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length){
        isDeleting = true;
        setTimeout(tick, pauseBetween);
        return;
      }
    } else {
      el.textContent = current.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0){
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
      }
    }
    setTimeout(tick, isDeleting ? typingSpeed / 2 : typingSpeed);
  }
  tick();
})();

/* ---------- LOADER: esconde quando a janela terminar de carregar ---------- */
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  loader.style.transition = 'opacity .6s ease, visibility .6s';
  loader.style.opacity = '0';
  setTimeout(() => loader.remove(), 700);
});
const textos = [
    "Designer Gráfico",
    "Criador de Carrosséis",
    "Editor de Vídeos",
    "Social Media"
];

let indexTexto = 0;
let indexLetra = 0;
const el = document.getElementById("typing");

function digitar() {
    const txt = textos[indexTexto];
    el.textContent = txt.substring(0, indexLetra);

    indexLetra++;

    if (indexLetra <= txt.length) {
        setTimeout(digitar, 80);
    } else {
        setTimeout(apagar, 1500);
    }
}

function apagar() {
    const txt = textos[indexTexto];
    el.textContent = txt.substring(0, indexLetra);

    indexLetra--;

    if (indexLetra >= 0) {
        setTimeout(apagar, 40);
    } else {
        indexTexto = (indexTexto + 1) % textos.length;
        setTimeout(digitar, 200);
    }
}

digitar();

