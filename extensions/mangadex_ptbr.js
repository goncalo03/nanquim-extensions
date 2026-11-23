/*
 * MangaDex PT-BR — extensão de comunidade do Nanquim.
 * Usa a API pública do MangaDex, filtrando traduções em pt-br.
 */
const api = 'https://api.mangadex.org';
const uploads = 'https://uploads.mangadex.org';

function titleOf(item) {
  var titles = (item.attributes && item.attributes.title) || {};
  return titles['pt-br'] || titles.en || Object.values(titles)[0] || 'Sem título';
}

function synopsisOf(item) {
  var d = (item.attributes && item.attributes.description) || {};
  return d['pt-br'] || d.en || '';
}

function coverOf(item) {
  var relationships = item.relationships || [];
  for (var i = 0; i < relationships.length; i++) {
    var rel = relationships[i];
    if (rel.type === 'cover_art' && rel.attributes && rel.attributes.fileName) {
      return uploads + '/covers/' + item.id + '/' + rel.attributes.fileName + '.512.jpg';
    }
  }
  return '';
}

function parseMangaList(body) {
  var json = JSON.parse(body);
  var items = json.data || [];
  var results = [];
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    results.push({
      id: item.id,
      title: titleOf(item),
      cover: coverOf(item)
    });
  }
  return results;
}

globalThis.__nanquimExtension = {
  id: 'mangadex-ptbr',
  name: 'MangaDex (PT-BR)',
  version: '1.0.0',
  lang: 'pt-BR',
  baseUrl: api,
  nsfw: false,

  requests: {
    popular: function () {
      return api + '/manga?limit=20'
        + '&availableTranslatedLanguage%5B%5D=pt-br'
        + '&order%5BfollowedCount%5D=desc'
        + '&includes%5B%5D=cover_art'
        + '&contentRating%5B%5D=safe'
        + '&contentRating%5B%5D=suggestive';
    },
    search: function (query, page) {
      var offset = (page - 1) * 20;
      return api + '/manga?title=' + encodeURIComponent(query)
        + '&limit=20&offset=' + offset
        + '&availableTranslatedLanguage%5B%5D=pt-br'
        + '&includes%5B%5D=cover_art';
    },
    details: function (id) {
      return api + '/manga/' + id + '?includes%5B%5D=cover_art';
    },
    chapters: function (id) {
      return api + '/manga/' + id + '/feed'
        + '?translatedLanguage%5B%5D=pt-br'
        + '&limit=100&order%5Bchapter%5D=desc';
    },
    pages: function (id) {
      return api + '/at-home/server/' + id;
    }
  },

  parsers: {
    popular: function (body) {
      return parseMangaList(body);
    },
    search: function (body) {
      return parseMangaList(body);
    },
    details: function (body) {
      var item = JSON.parse(body).data || {};
      return {
        title: titleOf(item),
        synopsis: synopsisOf(item),
        cover: coverOf(item)
      };
    },
    chapters: function (body) {
      var data = JSON.parse(body).data || [];
      var results = [];
      for (var i = 0; i < data.length; i++) {
        var chapter = data[i];
        var attrs = chapter.attributes || {};
        var number = attrs.chapter || '?';
        var name = attrs.title ? ' — ' + attrs.title : '';
        results.push({
          id: chapter.id,
          title: 'Cap. ' + number + name
        });
      }
      return results;
    },
    pages: function (body) {
      var json = JSON.parse(body);
      var base = json.baseUrl;
      var hash = json.chapter.hash;
      var files = json.chapter.data || [];
      var results = [];
      for (var i = 0; i < files.length; i++) {
        results.push(base + '/data/' + hash + '/' + files[i]);
      }
      return results;
    }
  }
};
