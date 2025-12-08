async function carregarPortfolio() {
    const req = await fetch("dados.json");
    const dados = await req.json();

    // Ordenar por data (mais recente primeiro)
    dados.sort((a, b) => new Date(b.data) - new Date(a.data));

    const container = document.getElementById("portfolio");

    dados.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("item");

        // ============================================================
        // 1 — IMAGEM ÚNICA
        // ============================================================
        if (item.tipo === "imagem") {
            card.innerHTML = `
                <img src="${item.arquivo}" class="img-unica">
                <div class="texto">
                    <h3>${item.titulo || ""}</h3>
                    <p>${item.descricao || ""}</p>
                </div>
            `;
        }

        // ============================================================
        // 2 — VÍDEO
        // ============================================================
        if (item.tipo === "video") {
            card.innerHTML = `
                <video src="${item.arquivo}" controls class="video"></video>
                <div class="texto">
                    <h3>${item.titulo || ""}</h3>
                    <p>${item.descricao || ""}</p>
                </div>
            `;
        }

        // ============================================================
        // 3 — CARROSSEL (desliza horizontal)
        // ============================================================
        if (item.tipo === "carrossel") {
            const imagens = item.arquivos
                .map(img => `<img src="${img}" class="carrossel-img">`)
                .join("");

            card.innerHTML = `
                <div class="carrossel">
                    <div class="carrossel-track">
                        ${imagens}
                    </div>
                </div>
                <div class="texto">
                    <h3>${item.titulo || ""}</h3>
                    <p>${item.descricao || ""}</p>
                </div>
            `;
        }

        // ============================================================
        // 4 — SLIDES COM BOTÕES
        // ============================================================
        if (item.tipo === "slide") {
            const imagens = item.arquivos
                .map(img => `<img src="${img}" class="slide-img">`)
                .join("");

            const idSlide = "slide_" + Math.random().toString(36).substr(2, 9);

            card.innerHTML = `
                <div class="slide-container" id="${idSlide}">
                    <button class="prev">◀</button>
                    <div class="slide-view">
                        ${imagens}
                    </div>
                    <button class="next">▶</button>
                </div>

                <div class="texto">
                    <h3>${item.titulo || ""}</h3>
                    <p>${item.descricao || ""}</p>
                </div>
            `;

            // Função do slide
            setTimeout(() => iniciarSlide(idSlide), 50);
        }

        // ============================================================
        // 5 — FORMATO A4
        // ============================================================
        if (item.tipo === "a4") {
            card.innerHTML = `
                <img src="${item.arquivo}" class="a4-img">
                <div class="texto">
                    <h3>${item.titulo || ""}</h3>
                    <p>${item.descricao || ""}</p>
                </div>
            `;
        }

        // Inserir no container
        container.appendChild(card);

        // Animação
        setTimeout(() => card.classList.add("show"), 100);
    });
}

/* =====================================================================
   FUNÇÃO DO SLIDE (com botões ⇦ e ⇨)
   ===================================================================== */
function iniciarSlide(id) {
    const container = document.getElementById(id);
    const view = container.querySelector(".slide-view");
    const slides = container.querySelectorAll(".slide-img");

    let index = 0;

    const atualizarSlide = () => {
        view.style.transform = `translateX(-${index * 100}%)`;
    };

    container.querySelector(".next").onclick = () => {
        index = (index + 1) % slides.length;
        atualizarSlide();
    };

    container.querySelector(".prev").onclick = () => {
        index = (index - 1 + slides.length) % slides.length;
        atualizarSlide();
    };
}

/* =====================================================================
   INICIAR O SISTEMA
   ===================================================================== */
carregarPortfolio();
