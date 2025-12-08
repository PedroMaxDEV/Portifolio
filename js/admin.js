// js/admin.js

// Login do admin
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("loginSection").style.display = "none";
      document.getElementById("adminSection").style.display = "block";
      carregarProdutos();
    })
    .catch(err => alert("Erro no login: " + err.message));
}

// Salvar novo produto
document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const preco = parseFloat(document.getElementById("preco").value);
  const descricao = document.getElementById("descricao").value;
  const categoria = document.getElementById("categoria").value;
  const destaque = document.getElementById("destaque").checked;
  const tags = document.getElementById("tags").value.split(",").map(t => t.trim());

  const imagensInput = document.getElementById("imagens");
  const urlsImagens = [];

  for (let i = 0; i < imagensInput.files.length; i++) {
    const file = imagensInput.files[i];
    const storageRef = storage.ref("produtos/" + file.name);
    await storageRef.put(file);
    const url = await storageRef.getDownloadURL();
    urlsImagens.push(url);
  }

  await db.collection("produtos").add({
    nome,
    preco,
    descricao,
    categoria,
    imagens: urlsImagens,
    destaque,
    tags
  });

  alert("Produto adicionado com sucesso!");
  document.getElementById("productForm").reset();
  carregarProdutos();
});

// Carregar produtos do Firestore
async function carregarProdutos() {
  const lista = document.getElementById("productListAdmin");
  lista.innerHTML = "";

  const snapshot = await db.collection("produtos").get();
  snapshot.forEach(doc => {
    const produto = doc.data();
    const li = document.createElement("li");
    li.textContent = `${produto.nome} - R$${produto.preco}`;
    lista.appendChild(li);
  });
}
