# projeto-ong
# ONG Renovar

Site institucional front-end para uma ONG, com páginas de apresentação, projetos e um **formulário de cadastro de voluntários** com validação, máscaras de entrada e persistência local. Não há back-end: tudo roda no navegador.

## Funcionalidades

- **Páginas:** início, missão, contato, endereço e projetos, com navegação por rotas (`#/inicio`, `#/projetos/doar`...) e menu hambúrguer no mobile.
- **Formulário de cadastro:**
  - Validação por campo (obrigatoriedade, formato, tipo, tamanho).
  - Validação de dígitos verificadores do CPF e bloqueio de data de nascimento futura.
  - Mensagens de erro sob cada campo e alerta geral no envio com falha.
  - Máscaras de CPF, telefone (fixo e celular), CEP e UF com a biblioteca [IMask](https://imask.js.org/), com fallback manual se a CDN falhar.
  - Preenchimento automático de endereço, cidade e UF pelo CEP ([ViaCEP](https://viacep.com.br/)).
  - Rascunho e histórico de envios salvos no `localStorage`.
  - Toast de confirmação e atualização dos badges de status.
- **Layout responsivo** com CSS Grid de 12 colunas e variáveis CSS para cores, tipografia e espaçamento.

## Estrutura

```
projeto-ong/
├── html/
│   ├── index.html          # páginas renderizadas por router.js
│   ├── projetos.html       # projetos, voluntariado e doações
│   └── cadastro.html       # formulário de cadastro
├── estilos/
│   └── style.css
├── img/                    # logo e favicon
├── js/
│   ├── router.js           # rotas e renderização por templates (index.html)
│   ├── cadastro.js         # orquestrador do formulário (ES Module)
│   └── modules/
│       ├── api.js          # rede: consulta ao ViaCEP
│       ├── storage.js      # Web Storage genérico (get/set JSON)
│       ├── repositorio.js  # o que persistir: rascunho e histórico
│       ├── validacao.js    # regras e sinalização visual por campo
│       ├── mascaras.js     # máscaras (IMask + fallback)
│       └── ui.js           # toast, alertas, badges, aviso do último envio
├── LICENSE
└── README.md
```

## Arquitetura do JavaScript

Cada módulo tem uma responsabilidade única, e as dependências seguem em uma só direção:

```
cadastro.js ──► api.js
            ├─► repositorio.js ──► storage.js
            ├─► validacao.js
            ├─► mascaras.js
            └─► ui.js
```

- `api.js` só faz requisições, `storage.js` só lê e grava, `ui.js` só exibe. Nenhum deles importa outro módulo de negócio.
- Os módulos se comunicam por parâmetros e valores de retorno, sem variáveis globais compartilhadas.
- Apenas `cadastro.js` conhece todos os módulos e liga eventos do formulário às camadas.

## Como executar

Os módulos ES6 **não funcionam abrindo o arquivo direto (`file://`)**. É preciso servir por HTTP:

```bash
# opção 1: Python
python -m http.server 8000

# opção 2: Node
npx serve .
```

Ou use a extensão **Live Server** do VS Code. Depois acesse `http://localhost:8000/html/index.html`.

O formulário usa a IMask por CDN, então é necessário ter internet na primeira carga. No `cadastro.html`, a ordem dos scripts importa:

```html
<script src="https://cdn.jsdelivr.net/npm/imask@7.6.1/dist/imask.min.js"></script>
<script type="module" src="../js/cadastro.js"></script>
```

## Dados e privacidade

- O `localStorage` guarda apenas o **rascunho** do formulário e um **histórico resumido** dos envios (nome, e-mail, cidade, UF e data), com no máximo 20 registros.
- **CPF e telefone não são gravados**, pois o `localStorage` é texto puro e legível por qualquer script da mesma origem.
- O envio real ainda não existe: o `submit` registra os dados no console. O ponto de integração é `cadastro.js`, no trecho que chama `console.log`, onde entraria uma função de `api.js` (por exemplo, um `POST /enviar-cadastro`).

## Pendências conhecidas

- Remover do final de `js/router.js` o bloco do formulário (a partir de `const form = ...`), que agora vive em `cadastro.js`.
- Adicionar o atributo `integrity` (SRI) à tag da IMask antes de publicar.
- Conectar o cadastro a um back-end.
- Testes automatizados dos módulos puros (`validacao.js`, `repositorio.js`).
- O código foi verificado apenas quanto à sintaxe. Falta testar no navegador o telefone fixo e celular, a restauração do rascunho e o preenchimento pelo CEP.

## Tecnologias

HTML5, CSS3 (Grid, variáveis CSS), JavaScript (ES Modules), IMask (CDN) e ViaCEP (API pública).

## Licença

Distribuído sob a licença MIT. Veja [LICENSE](LICENSE).

© 2026 Kaylane Alves
