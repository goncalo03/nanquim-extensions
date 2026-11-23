/*
 * MODELO DE EXTENSÃO — copie este arquivo e renomeie.
 * Não é incluído no index.json.
 */
const baseUrl = 'https://exemplo.com';

globalThis.__nanquimExtension = {
  id: 'minha-fonte',
  name: 'Minha Fonte (PT-BR)',
  version: '1.0.0',
  lang: 'pt-BR',
  baseUrl: baseUrl,
  nsfw: false,

  requests: {
    search: function (query, page) {
      return baseUrl + '/busca?q=' + encodeURIComponent(query) + '&page=' + page;
    },
    details: function (id) {
      return baseUrl + '/obra/' + encodeURIComponent(id);
    },
    chapters: function (id) {
      return baseUrl + '/obra/' + encodeURIComponent(id) + '/capitulos';
    },
    pages: function (id) {
      return baseUrl + '/capitulo/' + encodeURIComponent(id);
    }
  },

  parsers: {
    search: function (html) {
      // Exemplo usando os helpers Html:
      // var blocos = Html.all(html, '<article[^>]*class="manga"[^>]*>([\\s\\S]*?)<\\/article>');
      // return blocos.map(function (b) {
      //   return {
      //     id: Html.first(b[1], 'href="([^"]+)"'),
      //     title: Html.text(Html.first(b[1], '<h3[^>]*>([\\s\\S]*?)<\\/h3>')),
      //     cover: Html.first(b[1], 'data-src="([^"]+)"')
      //   };
      // });
      return [];
    },

    details: function (html) {
      return {
        title: Html.text(Html.first(html, '<h1[^>]*>([\\s\\S]*?)<\\/h1>')),
        synopsis: '',
        cover: ''
      };
    },

    chapters: function (html) {
      return [];
    },

    pages: function (html) {
      return [];
    }
  }
};
