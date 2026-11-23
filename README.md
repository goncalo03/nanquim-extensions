# Nanquim Extensions 📚

Repositório comunitário de extensões para o [**Nanquim**](https://github.com/goncalo03/nanquim-reader), um leitor de mangás em PT-BR.

A app **não hospeda mangás**: as extensões apenas dizem onde buscar e como interpretar o HTML de fontes públicas.

---

## Como usar na app

1. Abra o Nanquim e vá em **Extensões**
2. Toque no ícone de nuvem (repositórios)
3. Toque em **Adicionar repositório** e cole:

```
https://raw.githubusercontent.com/goncalo03/nanquim-extensions/main/index.json
```

4. Escolha uma extensão e toque em **Instalar**

A app valida o **SHA-256** do arquivo antes de instalar. Se o hash do `index.json` não conferir, a instalação é cancelada.

---

## Estrutura

```
.
├── catalog.json              # fonte da verdade dos metadados
├── index.json                # GERADO — não editar à mão
├── extensions/
│   ├── exemplo_ptbr.js       # fonte da extensão de demonstração
│   ├── exemplo_ptbr.pb       # extensão compilada em Protocol Buffers
│   └── _modelo.js            # modelo para novas extensões
├── nanquim_extension.proto   # schema .proto da extensão
├── scripts/
│   ├── compile-pb.js         # compila .js → .pb
│   └── generate-index.js     # gera/valida o index.json
└── .github/workflows/        # CI: sintaxe + hashes
```

## Extensões `.pb`

As extensões publicadas neste repositório usam **Protocol Buffers** (`.pb`).
O app lê o `.pb`, extrai o código JS do campo `code` e o executa no sandbox —
o usuário nunca precisa lidar com o binário diretamente.

Para gerar o `.pb` a partir de um `.js`:

```bash
node scripts/compile-pb.js extensions/sua-fonte.js
```

O schema está em `nanquim_extension.proto`. Campos: `id`, `name`, `version`,
`lang`, `baseUrl`, `code`, `nsfw` e `format` (por enquanto, apenas `js`).

---

## Contrato de uma extensão

O arquivo `.js` define um objeto global. A app faz o download da página e entrega o HTML para o parser — a extensão não acessa rede, arquivos nem o sistema.

```js
const baseUrl = 'https://exemplo.com';

globalThis.__nanquimExtension = {
  id: 'minha-fonte',
  name: 'Minha Fonte',
  version: '1.0.0',
  lang: 'pt-BR',
  baseUrl: baseUrl,
  nsfw: false,

  requests: {
    search: (q, p) => baseUrl + '/busca?q=' + encodeURIComponent(q) + '&page=' + p,
    details: (id) => baseUrl + '/obra/' + id,
    chapters: (id) => baseUrl + '/obra/' + id + '/capitulos',
    pages: (id) => baseUrl + '/capitulo/' + id,
  },

  parsers: {
    search: (html) => [
      { id: '/obra/1', title: 'One Piece', cover: 'https://.../capa.jpg' }
    ],
    details: (html) => ({ title: '', synopsis: '', cover: '' }),
    chapters: (html) => [{ id: 'cap-1', title: 'Capítulo 1' }],
    pages: (html) => ['https://.../1.jpg'],
  },
};
```

### Helpers disponíveis

| Helper | Uso |
|---|---|
| `Html.text(valor)` | remove tags e entidades HTML |
| `Html.first(html, regex, grupo)` | primeira ocorrência de uma regex |
| `Html.all(html, regex)` | todas as ocorrências de uma regex |

---

## Como contribuir

1. Faça um fork e crie um branch
2. Copie `extensions/_modelo.js` para `extensions/sua-fonte.js`
3. Adicione uma entrada em `catalog.json` (com `id`, `nome`, `versão`, `arquivo`)
4. Gere o índice:

```bash
node scripts/generate-index.js
```

5. Rode `node --check extensions/sua-fonte.js` para validar a sintaxe
6. Abra um pull request — o CI confere os hashes automaticamente

> Ao atualizar uma extensão, **incremente a versão** no JS e no `catalog.json`.

---

## ⚠️ Segurança e legal

- Extensões são código de terceiros executado num sandbox; ainda assim, baixe apenas de repositórios confiáveis
- O hash SHA-256 protege contra alterações no arquivo entre o índice e o download
- **Não adicione extensões que violem direitos autorais ou leis locais.** Este projeto é apenas o leitor.
