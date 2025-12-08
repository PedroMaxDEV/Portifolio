let produtos = [];
let carrinho = [];
let imagemAtual = 0;
let imagensProduto = [];

async function carregarProdutos() {
  const res = await fetch('dados/produtos.json');
  produtos = await res.json();
  exibirProdutos(produtos.filter(p => p.destaque));
}

function exibirProdutos(lista) {
  const container = document.getElementById('productList');
  container.innerHTML = '';

  lista.forEach(prod => {
    const card = document.createElement('div');
    card.classList.add('produto');

    const img = document.createElement('img');
    img.src = `https://pedromaxdev.github.io/jocelia-festas/${prod.imagens[0]}`;
    img.alt = prod.nome;
    img.addEventListener('click', () => abrirModalImagem(prod));

    const nome = document.createElement('h3');
    nome.textContent = prod.nome;

    const preco = document.createElement('p');
    preco.textContent = `R$ ${prod.preco.toFixed(2)}`;

    const desc = document.createElement('p');
    desc.textContent = prod.descricao;

    const btn = document.createElement('button');
    btn.textContent = 'Adicionar ao Carrinho';
    btn.addEventListener('click', () => adicionarAoCarrinho(prod));

    card.append(img, nome, preco, desc, btn);
    container.appendChild(card);
  });
}

function abrirModalImagem(prod) {
  imagensProduto = prod.imagens;
  imagemAtual = 0;
  document.getElementById('modalImage').src = `https://pedromaxdev.github.io/jocelia-festas/${imagensProduto[imagemAtual]}`;
  document.getElementById('imageModal').style.display = 'flex';
}

document.getElementById('prevImage').onclick = () => {
  if (imagemAtual > 0) imagemAtual--;
  atualizarImagemModal();
};
document.getElementById('nextImage').onclick = () => {
  if (imagemAtual < imagensProduto.length - 1) imagemAtual++;
  atualizarImagemModal();
};
document.getElementById('closeImageModal').onclick = () => {
  document.getElementById('imageModal').style.display = 'none';
};

function atualizarImagemModal() {
  document.getElementById('modalImage').src = `https://pedromaxdev.github.io/jocelia-festas/${imagensProduto[imagemAtual]}`;
}

function adicionarAoCarrinho(prod) {
  const itemExistente = carrinho.find(p => p.id === prod.id);
  if (itemExistente) {
    itemExistente.quantidade++;
  } else {
    carrinho.push({ ...prod, quantidade: 1 });
  }
  mostrarNotificacao(`Produto "${prod.nome}" adicionado ao carrinho!`);
}

function mostrarNotificacao(msg = 'Produto adicionado ao carrinho!') {
  const aviso = document.getElementById('notification');
  aviso.textContent = msg;
  aviso.classList.remove('hidden');
  aviso.style.opacity = '1';
  setTimeout(() => {
    aviso.style.opacity = '0';
    setTimeout(() => aviso.classList.add('hidden'), 300);
  }, 2000);
}

function atualizarCarrinho() {
  const lista = document.getElementById('cartItems');
  const total = document.getElementById('cartTotal');
  lista.innerHTML = '';

  let precoTotal = 0;
  carrinho.forEach(item => {
    const li = document.createElement('li');
    const itemTotal = item.preco * item.quantidade;
    precoTotal += itemTotal;
    li.innerHTML = `
      <strong>${item.nome}</strong> - ID: ${item.id} - Qtd: ${item.quantidade} - Unit: R$${item.preco.toFixed(2)} - Total: R$${itemTotal.toFixed(2)}
      ${item.categoria === 'kits' ? `<br><em>${item.descricao}</em>` : ''}
      <button onclick="removerDoCarrinho(${item.id})">Remover</button>
    `;
    lista.appendChild(li);
  });
  total.textContent = `Total: R$ ${precoTotal.toFixed(2)}`;
}

function removerDoCarrinho(id) {
  carrinho = carrinho.filter(p => p.id !== id);
  atualizarCarrinho();
}

document.getElementById('openCart').onclick = () => {
  atualizarCarrinho();
  document.getElementById('cartModal').style.display = 'flex';
};
document.getElementById('closeCart').onclick = () => {
  document.getElementById('cartModal').style.display = 'none';
};

document.getElementById('applyCupom').onclick = () => {
  const cupom = document.getElementById('cupomInput').value.trim().toUpperCase();
  if (cupom === '4ANOSJF') {
    carrinho = carrinho.map(p => ({ ...p, preco: p.preco * 0.9 }));
    atualizarCarrinho();
    alert('Cupom aplicado com sucesso!');
  } else {
    alert('Cupom inválido.');
  }
};

document.getElementById('finalizarCompra').onclick = () => {
  const dataFesta = prompt('Digite a data da festa (Ex: 10/05/2025):');
  if (!dataFesta) return;
  let mensagem = `Olá! Meu nome é ${nomeCliente || 'Cliente'} e quero agendar minha festa com os seguintes produtos:\n\n`;
  let totalGeral = 0;
  carrinho.forEach(p => {
    const totalItem = p.preco * p.quantidade;
    totalGeral += totalItem;
    mensagem += `➥ ${p.nome} | ID: ${p.id} | Qtd: ${p.quantidade} | Unit: R$${p.preco.toFixed(2)} | Total: R$${totalItem.toFixed(2)}`;
    if (p.categoria === 'kits') mensagem += ` | ${p.descricao}`;
    if (p.imagens && p.imagens[0]) {
      const imagemUrl = `https://pedromaxdev.github.io/jocelia-festas/${p.imagens[0]}`;
      mensagem += ` | Imagem: ${imagemUrl}`;
    }
    mensagem += '\n';
  });
  mensagem += `\nTotal geral: R$ ${totalGeral.toFixed(2)}\n`;
  mensagem += `Data da festa: ${dataFesta}\n`;
  mensagem += '\nSolicito atendimento para agendar com a atendente.';
  const url = `https://wa.me/+558189025672?text=${encodeURIComponent(mensagem)}`;
  window.location.href = url;
};

document.querySelectorAll('.category-btn').forEach(btn => {
  btn.onclick = () => {
    const cat = btn.getAttribute('data-category');
    if (cat === 'todos') {
      exibirProdutos(produtos);
    } else if (cat === 'destaques') {
      const destaques = produtos.filter(p => p.destaque);
      exibirProdutos(destaques);
    } else {
      const filtrados = produtos.filter(p => p.categoria === cat);
      exibirProdutos(filtrados);
    }
  };
});

// 🔍 Busca com agrupamento e suporte a tags
document.getElementById('searchBar').addEventListener('input', e => {
  const texto = e.target.value.toLowerCase();
  const sugestoesAgrupadas = {};

  produtos.forEach(prod => {
    const nome = prod.nome.toLowerCase();
    const descricao = (prod.descricao || '').toLowerCase();
    const tags = (prod.tags || []).map(t => t.toLowerCase());

    if (
      nome.includes(texto) ||
      descricao.includes(texto) ||
      tags.some(t => t.includes(texto)) ||
      `id:${prod.id}` === texto
    ) {
      if (!sugestoesAgrupadas[nome]) {
        sugestoesAgrupadas[nome] = [];
      }
      sugestoesAgrupadas[nome].push(prod);

      tags.forEach(tag => {
        const chaveTag = `#${tag}`;
        if (!sugestoesAgrupadas[chaveTag]) {
          sugestoesAgrupadas[chaveTag] = [];
        }
        sugestoesAgrupadas[chaveTag].push(prod);
      });
    }
  });

  const lista = document.getElementById('suggestions');
  lista.innerHTML = '';

  Object.keys(sugestoesAgrupadas).slice(0, 5).forEach(chave => {
    const grupo = sugestoesAgrupadas[chave];
    const li = document.createElement('li');
    li.textContent = `${chave} (${grupo.length} produtos)`;
    li.onclick = () => exibirProdutos(grupo);
    lista.appendChild(li);
  });
});

carregarProdutos();

// Sugestões visuais
const searchInput = document.getElementById('searchBar');
const suggestions = document.getElementById('suggestions');

searchInput.addEventListener('input', () => {
  suggestions.style.display = searchInput.value.trim() ? 'block' : 'none';
});

suggestions.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    searchInput.value = e.target.textContent;
    suggestions.style.display = 'none';
  }
});

document.addEventListener('click', (e) => {
  if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
    suggestions.style.display = 'none';
  }
});

// 💾 Nome do cliente persistente
let nomeCliente = localStorage.getItem('nomeCliente');
if (!nomeCliente || nomeCliente.trim() === '') {
  nomeCliente = prompt('Bem-vindo! Qual o seu nome?');
  if (nomeCliente && nomeCliente.trim() !== '') {
    localStorage.setItem('nomeCliente', nomeCliente.trim());
    alert(`Olá, ${nomeCliente.trim()}! Explore nossos produtos 😄`);
  }
}

document.getElementById('closeImageBtn').onclick = () => {
  document.getElementById('imageModal').style.display = 'none';
};

function closeModal() {
  document.querySelector('.modal').style.display = 'none';
}

window.addEventListener('click', function (e) {
  const modal = document.querySelector('.modal');
  if (e.target === modal) {
    modal.style.display = 'none';
  }

  // Inicializar Firebase se ainda não tiver
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Buscar produtos do Firestore
async function carregarProdutosFirebase() {
  const produtosFirebase = [];
  try {
    const snapshot = await db.collection("produtos").get();
    snapshot.forEach(doc => {
      const produto = doc.data();
      produtosFirebase.push({
        id: doc.id,
        nome: produto.nome,
        preco: produto.preco,
        descricao: produto.descricao,
        categoria: produto.categoria,
        imagens: produto.imagens || [],
        destaque: produto.destaque || false,
        tags: produto.tags || []
      });
    });
  } catch (err) {
    console.error("Erro ao carregar do Firebase:", err);
  }
  return produtosFirebase;
}

// Carregar tudo (JSON + Firebase)
async function carregarTodosProdutos() {
  try {
    // Do JSON
    const response = await fetch("produtos.json");
    const produtosJSON = await response.json();

    // Do Firebase
    const produtosFirebase = await carregarProdutosFirebase();

    // Junta
    const todosProdutos = [...produtosJSON, ...produtosFirebase];

    // Renderiza
    renderizarProdutos(todosProdutos);
  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
  }
}

// Chamar quando a página carregar
window.addEventListener("DOMContentLoaded", carregarTodosProdutos);


});
