/*
 * Extensão de demonstração do Nanquim (PT-BR).
 *
 * Funciona 100% offline: busca, detalhes, capítulos e páginas vêm de
 * arquivos HTML incluídos no app, servidos pelo esquema nanquim-demo://.
 *
 * Contrato da extensão:
 *   globalThis.__nanquimExtension = {
 *     id, name, version, lang, baseUrl,
 *     requests: { search(q,p), details(id), chapters(id), pages(id) },
 *     parsers:  { search(html), details(html), chapters(html), pages(html) }
 *   }
 *
 * O Nanquim faz o download da página e entrega o HTML para o parser.
 * Nenhum código da extensão acessa rede, arquivos ou o sistema.
 */
const baseUrl = 'nanquim-demo://';

globalThis.__nanquimExtension = {
  id: 'exemplo-ptbr',
  name: 'Nanquim Demo (PT-BR)',
  version: '1.1.0',
  lang: 'pt-BR',
  baseUrl: baseUrl,
  nsfw: false,

  requests: {
    search: function (query, page) {
      return baseUrl + 'search.html?q=' + encodeURIComponent(query) + '&page=' + page;
    },
    details: function (id) {
      return baseUrl + 'details.html?id=' + encodeURIComponent(id);
    },
    chapters: function (id) {
      return baseUrl + 'chapters.html?id=' + encodeURIComponent(id);
    },
    pages: function (id) {
      return baseUrl + 'pages.html?id=' + encodeURIComponent(id);
    }
  },

  parsers: {
    search: function (html) {
      var results = [];
      var blocks = Html.all(html, '<article[^>]*class="manga"[^>]*>([\\s\\S]*?)<\\/article>');
      for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i][1];
        var href = Html.first(block, 'href="([^"]+)"');
        var title = Html.text(Html.first(block, '<h3[^>]*>([\\s\\S]*?)<\\/h3>'));
        var cover = Html.first(block, 'data-src="([^"]+)"') || '';
        if (href && title) results.push({ id: href, title: title, cover: cover });
      }
      return results;
    },

    details: function (html) {
      return {
        title: Html.text(Html.first(html, '<h1[^>]*>([\\s\\S]*?)<\\/h1>')),
        synopsis: Html.text(Html.first(html, 'class="sinopse"[^>]*>([\\s\\S]*?)<\\/div>')),
        cover: Html.first(html, 'data-src="([^"]+)"') || ''
      };
    },

    chapters: function (html) {
      var chapters = [];
      var blocks = Html.all(html, '<a[^>]*class="capitulo"[^>]*>([\\s\\S]*?)<\\/a>');
      for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        var href = Html.first(block[0], 'href="([^"]+)"');
        var title = Html.text(block[1]);
        if (href) chapters.push({ id: href, title: title });
      }
      return chapters;
    },

    pages: function (html) {
      var pages = [];
      var urls = Html.all(html, 'data-src="(nanquim-demo:\\/\\/[^"]+)"');
      for (var i = 0; i < urls.length; i++) pages.push(urls[i][1]);
      return pages;
    }
  }
};
