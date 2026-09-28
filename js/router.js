const app = document.getElementById('app');
const menuToggle = document.getElementById('menu-toggle');

// Helper: cria um elemento do DOM com atributos e filhos
function el(tag, attrs = {}, ...filhos) {
  const node = document.createElement(tag);
  for (const [chave, valor] of Object.entries(attrs)) {
    node.setAttribute(chave, valor);
  }
  node.append(...filhos); // strings viram nós de texto (seguro contra XSS)
  return node;
}

// Views: cada uma devolve um título de aba e a <section> pronta
const views = {
  inicio: () => ({
    titulo: 'ONG Renovar - Início',
    node: el('section', { id: 'inicio' },
      el('h2', {}, 'Seja bem-vindo à ONG Renovar'),
      el('img', { src: '../img/logo-ong.jpeg', alt: 'Logo da ONG' }),
      el('p', {}, 'Lorem ipsum dolor sit amet consectetur adipisicing elit...')
    ),
  }),

  missao: () => ({
    titulo: 'ONG Renovar - Missão',
    node: el('section', { id: 'missao' },
      el('h2', {}, 'Nossa missão'),
      el('p', {}, 'Lorem ipsum dolor sit amet consectetur adipisicing elit...')
    ),
  }),

  contato: () => ({
    titulo: 'ONG Renovar - Contato',
    node: el('section', { id: 'contato' },
      el('h2', {}, 'Contato'),
      el('p', {}, 'E-mail: contato@ongrenovar.org'),
      el('p', {}, 'Telefone: (11) 99999-9999')
    ),
  }),

  endereco: () => ({
    titulo: 'ONG Renovar - Endereço',
    node: el('section', { id: 'endereco' },
      el('h2', {}, 'Endereço'),
      el('p', {}, 'Rua: XXXX, NX. São Paulo, SP')
    ),
  }),

  // Substitua pelo conteúdo do seu projetos.html
  projetos: () => ({
    titulo: 'ONG Renovar - Projetos',
    node: el('section', { id: 'projetos' },
      el('h2', {}, 'Nossos projetos'),
      el('p', {}, 'Conteúdo da página de projetos aqui.')
    ),
  }),

  naoEncontrada: () => ({
    titulo: 'ONG Renovar - 404',
    node: el('section', {},
      el('h2', {}, 'Página não encontrada'),
      el('a', { href: '#/inicio' }, 'Voltar ao início')
    ),
  }),
};

// Lê a rota atual a partir do hash: "#/missao" -> "missao"
function rotaAtual() {
  return location.hash.replace('#/', '') || 'inicio';
}

// Renderiza a view correspondente dentro da <main>
function render() {
  const criarView = views[rotaAtual()] ?? views.naoEncontrada;
  const { titulo, node } = criarView();

  app.replaceChildren(node);   // troca todo o conteúdo da <main>
  document.title = titulo;
  window.scrollTo(0, 0);
  menuToggle.checked = false;  // fecha o menu hambúrguer no mobile
}

// Intercepta toda mudança de navegação (clique, voltar, avançar, URL digitada)
window.addEventListener('hashchange', render);

// Renderização inicial (primeiro acesso ou F5)
render();