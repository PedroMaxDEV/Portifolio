const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html', 'utf8');
const embedded = html.match(/<script id="portfolio-data" type="application\/json">([\s\S]*?)<\/script>/)[1];
const expected = JSON.parse(fs.readFileSync('dados.json', 'utf8').replace(/^\uFEFF/, ''));
assert.deepEqual(JSON.parse(embedded), expected);
for (const project of expected) for (const file of project.arquivos || [project.arquivo]) assert.ok(fs.existsSync(file), file);
const source = fs.readFileSync('script.js', 'utf8');
const loader = source.slice(source.indexOf('async function load()'), source.indexOf('\nload();'));
async function scenario(protocol, fetchImpl) {
  let fetches = 0;
  const rendered = [];
  const context = vm.createContext({
    projects: [], location: { protocol },
    document: { querySelector: selector => selector === '#portfolio-data' ? { textContent: embedded } : { dataset: { filter: 'all' } } },
    grid: { setAttribute() {}, replaceChildren() { throw new Error('Catálogo existente apagado'); } },
    classify: () => 'social', render: () => rendered.push(context.projects.length),
    fetch: async (...args) => { fetches++; return fetchImpl(...args); }
  });
  await vm.runInContext(`${loader}\nload()`, context);
  assert.equal(rendered[0], 15);
  return { fetches, rendered };
}
(async () => {
  assert.equal((await scenario('file:', () => { throw new Error('fetch local não permitido'); })).fetches, 0);
  assert.deepEqual((await scenario('https:', () => { throw new Error('offline'); })).rendered, [15]);
  assert.deepEqual((await scenario('https:', () => ({ ok: false }))).rendered, [15]);
  assert.deepEqual((await scenario('https:', () => ({ ok: true, json: async () => expected.slice(0, 2) }))).rendered, [15, 2]);
  console.log('OK: abertura local, rede indisponível, HTTP 404 e atualização online; 15 projetos e 29 mídias presentes.');
})().catch(error => { console.error(error); process.exitCode = 1; });
const groupSource = source.slice(source.indexOf('function groupProjects('), source.indexOf('function createCarousel('));
const groupContext = vm.createContext({});
vm.runInContext(groupSource, groupContext);
const items = expected.map(item => ({...item, category: item.tipo === 'video' ? 'video' : 'image'}));
const groups = groupContext.groupProjects(items);
assert.equal(groups.length, 8);
assert.deepEqual(Array.from(groups.flatMap(group => group.items), item => item.titulo), expected.map(item => item.titulo));
const videoGroups = groupContext.groupProjects(items, 'video');
assert.equal(videoGroups[0].name, 'UBANNET · Comunicação digital');
assert.equal(videoGroups[0].items.length, 3);
console.log('OK: 8 grupos na ordem original; filtro de vídeos preserva as outras peças do projeto.');
const classifySource = source.match(/const classify=([^\n]+);/)[0];
const classified = vm.runInNewContext(classifySource + '\nclassify', {});
const academic = expected.find(item => item.arquivos?.includes('midias/data1.png'));
assert.equal(academic.tipo, 'slide');
assert.equal(classified(academic), 'slides');
assert.equal(classified(expected.find(item => item.arquivos?.includes('midias/UBANNET_01.png'))), 'carousel');
console.log('OK: apresentação acadêmica e carrossel de Instagram têm categorias distintas.');
