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
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // variáveis do drag por mouse
        let isDown = false;
        let startX;
        let scrollStart;

        // MOUSE events
        container.addEventListener("mousedown", (e) => {
            isDown = true;
            container.classList.add("active");
            startX = e.pageX - container.offsetLeft;
            scrollStart = container.scrollLeft;
            e.preventDefault();
        });

        container.addEventListener("mouseleave", () => {
            isDown = false;
            container.classList.remove("active");
        });

        container.addEventListener("mouseup", () => {
            isDown = false;
            container.classList.remove("active");
        });

        container.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            const x = e.pageX - container.offsetLeft;
            const walk = x - startX;
            container.scrollLeft = scrollStart - walk;
        });

        // TOUCH events (mobile)
        let touchStartX = 0;
        let touchScrollStart = 0;

        container.addEventListener("touchstart", (e) => {
            touchStartX = e.touches[0].clientX;
            touchScrollStart = container.scrollLeft;
        }, {passive: true});

        container.addEventListener("touchmove", (e) => {
            const x = e.touches[0].clientX;
            const walk = x - touchStartX;
            container.scrollLeft = touchScrollStart - walk;
        }, {passive: true});

        // Opcional: snap automático ao soltar — centra na imagem mais próxima
        container.addEventListener("touchend", () => {
            snapToNearest(container);
        });
        container.addEventListener("mouseup", () => {
            snapToNearest(container);
        });
        container.addEventListener("mouseleave", () => {
            snapToNearest(container);
        });
    });

    // função helper para snap
    function snapToNearest(container) {
        const children = Array.from(container.querySelectorAll(".carrossel img"));
        if (children.length === 0) return;
        const containerWidth = container.clientWidth;
        // calcula o índice mais próximo com base no scrollLeft
        const index = Math.round(container.scrollLeft / containerWidth);
        container.scrollTo({
            left: index * containerWidth,
            behavior: 'smooth'
        });
    }
}


/* ============================================================
   INICIAR SISTEMA
============================================================ */
carregarPortfolio();
