const grid=document.querySelector('#projects'),dialog=document.querySelector('#viewer'),media=document.querySelector('#media');
const filters=[...document.querySelectorAll('[data-filter]')];
const carouselObservers = new Map();
function releaseCarousels(root) {
  for (const [track, observer] of carouselObservers) {
    if (root.contains(track)) { observer.disconnect(); carouselObservers.delete(track); }
  }
}
let projects=[],current=null,slide=0;
const labels={social:'Social media',carousel:'Carrossel',slides:'Apresentação',video:'Vídeo & processo',identity:'Identidade visual'};
const classify=item=>item.tipo==='slide'?'slides':item.tipo==='video'?'video':/logomarca/i.test(item.titulo)?'identity':(item.arquivos?.length>1||item.tipo==='a4')?'carousel':'social';
function el(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text)node.textContent=text;return node;}
function groupProjects(items, filter = 'all') {
  const groups = new Map();
  items.forEach((item, index) => {
    const name = item.projeto || item.titulo || `Projeto ${index + 1}`;
    if (!groups.has(name)) groups.set(name, { name, items: [] });
    groups.get(name).items.push(item);
  });
  // O filtro seleciona projetos completos, sem separar suas peças e processos.
  return [...groups.values()].filter(group => filter === 'all' || group.items.some(item => item.category === filter));
}

function createPresentation(item) {
  const wrapper = el('div', 'presentation');
  const overview = el('div', 'slide-overview');
  overview.append(el('p', 'preview-label', '01 / TODAS AS PÁGINAS'));
  const thumbnails = el('div', 'slide-thumbnails');
  thumbnails.setAttribute('role', 'group');
  thumbnails.setAttribute('aria-label', `Páginas de ${item.titulo}`);
  let page = 0;
  const stage = el('div', 'projection-stage');
  stage.tabIndex = 0;
  stage.setAttribute('role', 'region');
  stage.setAttribute('aria-label', 'Apresentação projetada. Use as setas para mudar de página.');
  const screen = el('div', 'projection-screen');
  const previous = el('button', '', '←');
  previous.setAttribute('aria-label', 'Página anterior');
  const next = el('button', '', '→');
  next.setAttribute('aria-label', 'Próxima página');
  const count = el('span', 'projection-count');
  count.setAttribute('aria-live', 'polite');
  const buttons = item.arquivos.map((file, index) => {
    const button = el('button', 'slide-thumbnail');
    button.setAttribute('aria-label', `Mostrar página ${index + 1}`);
    const image = el('img');
    image.src = file; image.alt = `${item.titulo} — página ${index + 1} completa`; image.loading = 'lazy';
    button.append(image, el('span', '', `PÁGINA ${String(index + 1).padStart(2, '0')}`));
    button.addEventListener('click', () => show(index));
    thumbnails.append(button);
    return button;
  });
  function show(index) {
    page = Math.max(0, Math.min(item.arquivos.length - 1, index));
    const image = el('img', 'projected-page');
    image.src = item.arquivos[page];
    image.alt = `${item.titulo} — página ${page + 1} de ${item.arquivos.length}`;
    image.draggable = false;
    image.addEventListener('load', () => screen.style.setProperty('--slide-ratio', image.naturalWidth / image.naturalHeight));
    screen.replaceChildren(image);
    count.textContent = `Página ${page + 1} de ${item.arquivos.length}`;
    previous.disabled = page === 0;
    next.disabled = page === item.arquivos.length - 1;
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === page)));
  }
  previous.addEventListener('click', () => show(page - 1));
  next.addEventListener('click', () => show(page + 1));
  stage.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); event.stopPropagation(); show(page + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  let pointer = null;
  screen.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    pointer = { x: event.clientX, y: event.clientY };
    screen.setPointerCapture(event.pointerId);
  });
  screen.addEventListener('pointerup', event => {
    if (!pointer) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    pointer = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(page + (dx < 0 ? 1 : -1));
  });
  screen.addEventListener('pointercancel', () => { pointer = null; });
  screen.addEventListener('lostpointercapture', () => { pointer = null; });
  const projector = el('div', 'projector-hardware');
  projector.setAttribute('aria-hidden', 'true');
  projector.innerHTML = '<div class="projector-body"><span class="projector-vents"></span><span class="projector-led"></span><span class="projector-lens"></span></div><div class="projector-beam"></div>';
  const controls = el('div', 'projection-controls');
  controls.append(previous, count, next);
  overview.append(thumbnails);
  stage.append(el('p', 'preview-label', '02 / SALA DE PROJEÇÃO'), projector, screen, controls, el('p', 'projection-hint', 'Passe as páginas pelas setas, pelo teclado ou deslizando sobre o slide.'));
  wrapper.append(overview, stage);
  show(0);
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { stage.classList.add('projector-on'); observer.disconnect(); }
    }, { threshold: .15 });
    observer.observe(stage);
    carouselObservers.set(stage, observer);
  } else stage.classList.add('projector-on');
  return wrapper;
}

function createCarousel(item) {
  const wrapper = el('div', 'panorama');
  const overview = el('div', 'carousel-overview');
  overview.append(el('p', 'preview-label', '01 / ARTE COMPLETA'));
  const complete = el('div', 'complete-strip');
  complete.style.setProperty('--parts', item.arquivos.length);
  complete.setAttribute('aria-label', `Arte completa: ${item.titulo}`);
  item.arquivos.forEach((file, index) => {
    const image = el('img');
    image.src = file;
    image.alt = `Arte completa — parte ${index + 1}`;
    image.loading = 'lazy';
    complete.append(image);
  });
  overview.append(complete, el('p', 'preview-explanation', 'Todas as partes juntas. Um único desenho, do começo ao fim.'));
  const simulation = el('div', 'carousel-simulation');
  simulation.append(el('p', 'preview-label', '02 / PRÉVIA NO INSTAGRAM'));
  const instagram = el('div', 'instagram-preview');
  const profile = el('div', 'instagram-profile');
  const avatar = el('img');
  avatar.src = 'midias/minha-foto.jpg'; avatar.alt = ''; avatar.loading = 'lazy';
  const account = el('div', 'instagram-account');
  account.append(el('strong', '', 'pedromax14'), el('span', '', 'Prévia do carrossel'));
  const menuIcon = el('span', 'instagram-menu', '•••');
  menuIcon.setAttribute('aria-hidden', 'true');
  profile.append(avatar, account, menuIcon);
  const track = el('div', 'panorama-track');
  track.tabIndex = 0;
  track.setAttribute('role', 'region');
  track.setAttribute('aria-label', `Carrossel: ${item.titulo}. Arraste ou use as setas.`);
  const images = item.arquivos.map((file, index) => {
    const image = el('img');
    image.src = file;
    image.alt = `${item.titulo} — parte ${index + 1} de ${item.arquivos.length}`;
    image.draggable = false;
    image.loading = 'lazy';
    if (index === 0) image.addEventListener('load', () => {
      track.style.setProperty('--image-ratio', image.naturalWidth / image.naturalHeight);
    });
    track.append(image);
    return image;
  });
  const controls = el('div', 'panorama-controls');
  const hint = el('span', 'panorama-hint', 'ARRASTE PARA EXPLORAR →');
  const position = el('span', 'panorama-position');
  position.setAttribute('aria-live', 'polite');
  const dots = el('div', 'instagram-dots');
  const dotNodes = item.arquivos.map((_, index) => {
    const dot = el('button', 'instagram-dot');
    dot.setAttribute('aria-label', `Ir para imagem ${index + 1}`);
    dot.addEventListener('click', () => track.scrollTo({ left: index * track.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));
    dots.append(dot);
    return dot;
  });
  const previous = el('button', '', '←');
  const next = el('button', '', '→');
  previous.setAttribute('aria-label', 'Parte anterior');
  next.setAttribute('aria-label', 'Próxima parte');
  const update = () => {
    const maximum = track.scrollWidth - track.clientWidth;
    previous.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= maximum - 2;
    const active = Math.max(0, Math.min(images.length - 1, Math.round(track.scrollLeft / (track.clientWidth || 1))));
    position.textContent = `${active + 1} / ${images.length}`;
    dotNodes.forEach((dot, index) => dot.setAttribute('aria-current', String(index === active)));
  };
  const advance = direction => {
    const width = images[0].getBoundingClientRect().width;
    track.scrollBy({ left: direction * width, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  previous.addEventListener('click', () => advance(-1));
  next.addEventListener('click', () => advance(1));
  track.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); event.stopPropagation(); advance(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  let drag = null;
  track.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = { x: event.clientX, left: track.scrollLeft };
    track.setPointerCapture(event.pointerId);
    track.classList.add('dragging');
    event.preventDefault();
    track.focus({ preventScroll: true });
  });
  track.addEventListener('pointermove', event => {
    if (drag) track.scrollLeft = drag.left + drag.x - event.clientX;
  });
  const stop = () => {
    if (!drag) return;
    drag = null;
    const target = Math.round(track.scrollLeft / track.clientWidth) * track.clientWidth;
    track.classList.remove('dragging');
    track.scrollTo({ left: target, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  track.addEventListener('pointerup', stop);
  track.addEventListener('pointercancel', stop);
  track.addEventListener('lostpointercapture', stop);
  track.addEventListener('scroll', update, { passive: true });
  images.forEach(img => img.addEventListener('load', update));
  controls.append(hint, position, previous, next);
  const socialIcons = el('div', 'instagram-icons');
  socialIcons.setAttribute('aria-hidden', 'true');
  socialIcons.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg><svg viewBox="0 0 24 24"><path d="M21 11.5a9 9 0 0 1-9 9 10 10 0 0 1-4-.9L3 21l1.4-4.7a9 9 0 1 1 16.6-4.8Z"/></svg><svg viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"/></svg><svg class="save-icon" viewBox="0 0 24 24"><path d="M5 3h14v19l-7-5-7 5V3Z"/></svg>';
  const caption = el('p', 'instagram-caption');
  caption.append(el('strong', '', 'pedromax14 '), document.createTextNode(item.titulo));
  instagram.append(profile, track, socialIcons, dots, caption, controls);
  simulation.append(instagram, el('p', 'simulation-hint', 'Arraste para o lado e veja uma imagem continuar na outra.'));
  wrapper.append(overview, simulation);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(update);
    observer.observe(track);
    carouselObservers.set(track, observer);
  }
  requestAnimationFrame(update);
  return wrapper;
}

function render(filter = 'all') {
  releaseCarousels(grid);
  grid.replaceChildren();
  const groups = groupProjects(projects, filter);
  document.querySelector('#count').textContent = `${groups.length} projetos · ${groups.reduce((sum, group) => sum + group.items.length, 0)} peças`;
  groups.forEach((group, index) => {
    const section = el('section', 'project-group');
    const heading = el('div', 'project-group-heading');
    const title = el('h3', '', group.name);
    title.id = `project-group-${index}`;
    section.setAttribute('aria-labelledby', title.id);
    heading.append(el('span', 'group-number', String(index + 1).padStart(2, '0')), title, el('span', 'group-total', `${group.items.length} ${group.items.length === 1 ? 'peça' : 'peças'}`));
    const contents = el('div', 'group-pieces');
    group.items.forEach(item => {
      const card = el('article', 'project');
      const sequence = item.arquivos?.length > 1;
      if (sequence) {
        card.classList.add('project-panorama');
        card.append(item.tipo === 'slide' ? createPresentation(item) : createCarousel(item));
      } else if (item.tipo === 'video') {
        const video = el('video', 'piece-video');
        video.src = item.arquivo; video.controls = true; video.playsInline = true; video.preload = 'metadata';
        video.setAttribute('aria-label', item.titulo);
        card.append(video);
      } else {
        const button = el('button', 'project-open');
        button.setAttribute('aria-label', `Ampliar: ${item.titulo}`);
        const image = el('img'); image.src = item.arquivos?.[0] || item.arquivo; image.alt = item.titulo; image.loading = 'lazy';
        const cover = el('div', 'cover'); cover.append(image, el('span', 'arrow', '↗'));
        button.append(cover); button.addEventListener('click', () => openProject(item)); card.append(button);
      }
      const meta = el('div', 'meta');
      meta.append(el('span', '', labels[item.category].toUpperCase()), el('span', '', item.data?.slice(0, 4)));
      card.append(meta, el('h4', '', item.titulo));
      if (item.descricao && !item.descricao.startsWith('Arraste')) card.append(el('p', '', item.descricao));
      if (sequence) {
        const expand = el('button', 'expand-carousel', 'Explorar em tela ampliada ↗');
        expand.addEventListener('click', () => openProject(item)); card.append(expand);
      }
      contents.append(card);
    });
    section.append(heading, contents); grid.append(section);
  });
}
function showSlide() {
  media.replaceChildren();
  const sequence = current.arquivos?.length > 1;
  media.classList.toggle('has-panorama', !!sequence);
  document.querySelector('.viewer-navigation').hidden = true;
  if (sequence) { media.append(current.tipo === 'slide' ? createPresentation(current) : createCarousel(current)); return; }
  const video = current.tipo === 'video';
  const node = el(video ? 'video' : 'img');
  node.src = current.arquivos?.[0] || current.arquivo;
  if (video) { node.controls = true; node.playsInline = true; } else node.alt = current.titulo;
  media.append(node);
}

function openProject(item){current=item;slide=0;document.querySelector('#viewer-title').textContent=item.titulo;document.querySelector('#viewer-category').textContent=labels[item.category];document.querySelector('#description').textContent=item.descricao?.startsWith('Arraste')?'Explore as imagens pelas setas ou deslize para os lados.':item.descricao||'';showSlide();dialog.showModal();document.body.classList.add('modal-open');}
document.querySelector('#close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { media.querySelector('video')?.pause(); releaseCarousels(media); media.replaceChildren(); document.body.classList.remove('modal-open'); });
dialog.addEventListener('click', event => { const bounds = dialog.getBoundingClientRect(); if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close(); });
filters.forEach(button=>button.addEventListener('click',()=>{filters.forEach(other=>{const selected=other===button;other.classList.toggle('active',selected);other.setAttribute('aria-pressed',String(selected));});render(button.dataset.filter);}));
const menu=document.querySelector('.menu'),nav=document.querySelector('#nav');function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menu');}menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});document.querySelector('#year').textContent=new Date().getFullYear();
async function load() {
  grid.setAttribute('aria-busy', 'true');
  let data = null;
  // O catálogo embutido funciona mesmo em file://, onde fetch é bloqueado.
  try {
    const embedded = JSON.parse(document.querySelector('#portfolio-data').textContent);
    if (Array.isArray(embedded)) data = embedded;
  } catch { /* Em hospedagens antigas, ainda podemos ler dados.json. */ }

  const display = items => {
    projects = items.map(item => ({ ...item, category: classify(item) }));
    render(document.querySelector('[data-filter].active').dataset.filter);
  };

  try {
    if (data) display(data);
    if (location.protocol !== 'file:') {
      const response = await fetch('dados.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error('Não foi possível atualizar o catálogo.');
      const updated = await response.json();
      if (!Array.isArray(updated)) throw new Error('Catálogo inválido.');
      if (JSON.stringify(updated) !== JSON.stringify(data)) display(updated);
    } else if (!data) {
      throw new Error('Catálogo local indisponível.');
    }
  } catch {
    // Uma falha na atualização não deve apagar os trabalhos já exibidos.
    if (!data) {
      grid.replaceChildren(el('p', '', 'Não foi possível carregar os projetos agora.'));
      const retry = el('button', 'button', 'Tentar novamente ↻');
      retry.addEventListener('click', load);
      grid.append(retry);
    }
  } finally {
    grid.setAttribute('aria-busy', 'false');
  }
}
load();
if('IntersectionObserver'in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('pending');observer.unobserve(entry.target);}}),{threshold:.12});document.querySelectorAll('.section-heading,.about-art,.about-copy,.contact h2').forEach(node=>{node.classList.add('reveal','pending');observer.observe(node);});}
