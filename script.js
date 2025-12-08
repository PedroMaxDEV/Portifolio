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
    document.querySelectorAll(".draggable").forEach(container => {
        const carrossel = container.querySelector(".carrossel");
        let isDown = false;
        let startX;
        let scrollLeft;

        // Mouse
        container.addEventListener("mousedown", (e) => {
            isDown = true;
            container.classList.add("active");
            startX = e.pageX - container.offsetLeft;
            scrollLeft = carrossel.offsetLeft;
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
            e.preventDefault();

            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX);

            carrossel.style.transform = `translateX(${walk}px)`;
        });

        // TOUCH (celular)
        let touchStart = 0;
        let currentX = 0;

        container.addEventListener("touchstart", (e) => {
            touchStart = e.touches[0].clientX;
        });

        container.addEventListener("touchmove", (e) => {
            currentX = e.touches[0].clientX - touchStart;
            carrossel.style.transform = `translateX(${currentX}px)`;
        });

        container.addEventListener("touchend", () => {
            carrossel.style.transform = "translateX(0)";
        });
    });
}

/* ============================================================
   INICIAR SISTEMA
============================================================ */
carregarPortfolio();
