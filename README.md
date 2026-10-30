# Portfólio MAXDEV

Abra `index.html` diretamente no navegador ou execute `npm run dev` e acesse http://127.0.0.1:4173.

## Atualizar trabalhos

1. Coloque os arquivos na pasta `midias`.
2. Edite o catálogo em `dados.json`.
3. Execute `npm run sync` para atualizar também o catálogo embutido no HTML.

Use o mesmo campo `projeto` nas peças que pertencem ao mesmo trabalho. A ordem dos grupos é a da primeira aparição no JSON; as peças dentro deles e as imagens em `arquivos` também mantêm a sequência do catálogo. Os filtros mostram o grupo completo, incluindo as outras peças e vídeos relacionados.

Carrosséis com várias imagens têm duas visualizações: a composição completa com todas as partes juntas e, abaixo, uma simulação de post do Instagram. A simulação mostra uma imagem inteira por vez, preserva a continuidade durante o arraste e aceita toque, mouse, setas e indicadores de página. A prévia é apenas visual, sem publicar ou interagir com o Instagram.

Para apresentações, use `"tipo": "slide"` e a lista `arquivos` na ordem das páginas. Esse tipo tem filtro próprio, miniaturas completas e numeradas no topo e uma tela com animação de projetor abaixo. A navegação funciona pelas miniaturas, setas, teclado ou deslize; a preferência de movimento reduzido desativa a animação inicial.

O catálogo embutido permite abrir o site sem servidor. Em HTTP/HTTPS, a página também consulta `dados.json` para atualizar os trabalhos, preservando a galeria se a rede falhar. Ao publicar, envie o HTML, CSS, JavaScript, JSON e a pasta `midias` juntos.

## Verificação

Execute `npm run check` e `npm test`. Os testes cobrem a abertura local sem fetch, falhas de rede, resposta 404, atualização online e a existência das mídias.
