const app = document.getElementById('app');
const menuToggle = document.getElementById('menu-toggle');

/* ========== HELPERS ========== */

// Cria elemento do DOM (usado onde não há template: 404 e submenu)
function el(tag, attrs = {}, ...filhos) {
  const node = document.createElement(tag);
  for (const [chave, valor] of Object.entries(attrs)) {
    node.setAttribute(chave, valor);
  }
  node.append(...filhos); // strings viram nós de texto (seguro contra XSS)
  return node;
}

// Clona o conteúdo de um <template> pelo id
const clonar = (id) => document.getElementById(id).content.cloneNode(true);

/* ========== DADOS DE ORIGEM (sem tags HTML) ========== */

const secoes = [
  {
    id: 'inicio',
    titulo: 'Seja bem-vindo à ONG Renovar',
    menu: 'Início',
    imagem: {
      src: '../img/logo-ong.jpeg',
      alt: 'Logo da ONG. A logo são mãos que abraçam uma muda de árvore.',
    },
    paragrafos: [
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus saepe animi facere molestias deleniti facilis ut illum placeat! Cum, dolorem mollitia? Fugiat, repellendus non. Sapiente quam consectetur totam esse aliquid?',
    ],
  },
  {
    id: 'missao',
    titulo: 'Nossa missão',
    menu: 'Missão',
    paragrafos: [
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quidem esse similique sequi nihil quaerat facilis placeat qui distinctio, rerum cupiditate, vel eligendi illo neque, suscipit officiis voluptatem debitis! Dignissimos, libero!',
    ],
  },
  {
    id: 'contato',
    titulo: 'Contato',
    menu: 'Contato',
    paragrafos: ['E-mail: contato@ongrenovar.org', 'Telefone: (11) 99999-9999'],
  },
  {
    id: 'endereco',
    titulo: 'Endereço',
    menu: 'Endereço',
    paragrafos: ['Rua: XXXX, NX. São Paulo, SP'],
  },
];

const secoesProjetos = [
  {
    id: 'ajudar',
    titulo: 'Projetos e Como Ajudar',
    menu: 'Como ajudar',
    paragrafos: [
      'A atuação da nossa ONG é movida pela transformação social. Conheça abaixo as nossas principais frentes de trabalho e descubra como você pode fazer a diferença hoje mesmo.',
    ],
  },
  {
    id: 'atuacao',
    titulo: 'Nossas Frentes de Atuação',
    menu: 'Frentes de atuação',
    grupos: [
      {
        subtitulo: 'Conheça as iniciativas contínuas que mantemos em diferentes áreas vulneráveis:',
        itens: [
          { destaque: 'Educação e Futuro', texto: 'Oficinas de reforço escolar, tecnologia e capacitação profissional para jovens.' },
          { destaque: 'Saúde e Bem-Estar', texto: 'Atendimentos comunitários, apoio psicológico e distribuição de kits de higiene.' },
          { destaque: 'Sustentabilidade Comunitária', texto: 'Hortas urbanas e projetos de reciclagem para geração de renda local.' },
        ],
      },
    ],
  },
  {
    id: 'voluntario',
    titulo: 'Faça Parte: Programa de Voluntariado',
    menu: 'Voluntariado',
    paragrafos: ['Doar o seu tempo e talento é uma das formas mais valiosas de fortalecer nossa causa.'],
    grupos: [
      {
        subtitulo: 'Como Funciona o Voluntariado?',
        ordenada: true,
        itens: [
          { destaque: 'Escolha sua Área', texto: 'Atue em campo, na organização de eventos ou em suporte administrativo remoto.' },
          { destaque: 'Inscreva-se', texto: 'Preencha o formulário e passe por nossa conversa de alinhamento.' },
          { destaque: 'Capacitação', texto: 'Participe do nosso treinamento inicial para conhecer a fundo os projetos.' },
        ],
      },
    ],
    link: { href: './cadastro.html', texto: 'Link para se voluntariar' },
  },
  {
    id: 'doar',
    titulo: 'Transforme Vidas: Como Doar',
    menu: 'Doações',
    paragrafos: ['Sua contribuição financeira garante a manutenção e o alcance de todas as nossas atividades.'],
    grupos: [
      {
        subtitulo: 'Formas de Doação',
        itens: [
          { destaque: 'Doação Recorrente (Mensal)', texto: 'Torne-se um mantenedor e garanta a sustentabilidade de longo prazo.' },
          { destaque: 'Doação Pontual', texto: 'Contribua com qualquer valor via PIX, cartão de crédito ou boleto.' },
          { destaque: 'Doação de Mantimentos', texto: 'Recebemos alimentos não perecíveis, roupas e materiais escolares no nosso centro de coleta.' },
        ],
      },
      {
        subtitulo: 'Transparência e Destinação dos Recursos',
        itens: [
          { destaque: '85%', texto: 'direcionados diretamente aos projetos sociais de ponta.' },
          { destaque: '10%', texto: 'aplicados na manutenção e estrutura das sedes comunitárias.' },
          { destaque: '5%',  texto: 'investidos na captação de novos recursos e prestação de contas.' },
        ],
      },
    ],
    link: { href: '#', texto: 'Link de uma plataforma especializada em captação de recursos' },
  },
];

/* ========== SISTEMA DE TEMPLATES (dados -> DOM) ========== */

// Item de lista: <li><strong>destaque:</strong> <span>texto</span></li>
function criarItem(item) {
  const frag = clonar('tpl-item');
  frag.querySelector('strong').textContent = `${item.destaque}:`;
  frag.querySelector('span').textContent = item.texto;
  return frag;
}

// Grupo: subtítulo + lista (<ol> ou <ul>)
function criarGrupo(grupo) {
  const frag = clonar('tpl-grupo');
  frag.querySelector('h3').textContent = grupo.subtitulo;

  const lista = document.createElement(grupo.ordenada ? 'ol' : 'ul');
  lista.append(...grupo.itens.map(criarItem));

  frag.querySelector('.grupo').append(lista);
  return frag;
}

// Seção completa; imagem, parágrafos, grupos e link são opcionais
function criarSecao(dados) {
  const frag = clonar('tpl-secao');

  frag.querySelector('section').id = dados.id;
  frag.querySelector('h2').textContent = dados.titulo;

  const img = frag.querySelector('img');
  if (dados.imagem) {
    img.setAttribute('src', dados.imagem.src);
    img.setAttribute('alt', dados.imagem.alt);
  } else {
    img.remove();
  }

  const textos = frag.querySelector('.textos');
  (dados.paragrafos ?? []).forEach((t) => {
    const p = document.createElement('p');
    p.textContent = t;
    textos.append(p);
  });

  frag.querySelector('.grupos').append(...(dados.grupos ?? []).map(criarGrupo));

  const a = frag.querySelector('a.link');
  if (dados.link) {
    a.href = dados.link.href;
    a.textContent = dados.link.texto;
  } else {
    a.remove();
  }

  return frag;
}

/* ========== TABELA DE ROTAS ========== */

const views = {};

// Rotas geradas a partir dos dados: #/inicio, #/missao, #/contato, #/endereco
secoes.forEach((s) => {
  views[s.id] = () => ({
    titulo: `ONG Renovar - ${s.titulo}`,
    node: criarSecao(s),
  });
});

// Rota #/projetos: submenu (com el) + todas as seções (com template)
views.projetos = () => {
  const submenu = el('nav', { class: 'submenu' },
    ...secoesProjetos.map((s) => el('a', { href: `#/projetos/${s.id}` }, s.menu))
  );

  const node = document.createDocumentFragment();
  node.append(submenu, ...secoesProjetos.map(criarSecao));

  return { titulo: 'ONG Renovar - Projetos', node };
};

views.naoEncontrada = () => ({
  titulo: 'ONG Renovar - 404',
  node: el('section', {},
    el('h2', {}, 'Página não encontrada'),
    el('a', { href: '#/inicio' }, 'Voltar ao início')
  ),
});

/* ========== ROTEAMENTO ========== */

// "#/projetos/doar" -> { rota: "projetos", ancora: "doar" }
function rotaAtual() {
  const [rota, ancora] = location.hash.replace('#/', '').split('/');
  return { rota: rota || 'inicio', ancora };
}

function render() {
  const { rota, ancora } = rotaAtual();
  const criarView = views[rota] ?? views.naoEncontrada;
  const { titulo, node } = criarView();

  app.replaceChildren(node);   // troca todo o conteúdo da <main>
  document.title = titulo;
  menuToggle.checked = false;  // fecha o menu hambúrguer no mobile

  // Sub-rota: rola até a seção; senão, volta ao topo
  const alvo = ancora && document.getElementById(ancora);
  alvo ? alvo.scrollIntoView() : window.scrollTo(0, 0);
}

// Intercepta toda mudança de navegação (clique, voltar, avançar, URL digitada)
window.addEventListener('hashchange', render);

// Renderização inicial (primeiro acesso ou F5)
render();

const form = document.querySelector('form');
const badgeStatus = document.querySelector('.badge-warning');
const badgePasso = document.querySelector('.badge-info');
const alerta = document.querySelector('.alert-warning');
const toast = document.querySelector('.toast');

/* ---------- Máscaras (funções puras: texto -> texto formatado) ---------- */
const mascaras = {
  cpf: (v) => v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2'),

  telefone: (v) => v.replace(/\D/g, '').slice(0, 11)
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2'),

  cep: (v) => v.replace(/\D/g, '').slice(0, 8)
    .replace(/(\d{5})(\d{1,3})$/, '$1-$2'),

  estado: (v) => v.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase(),
};

/* ---------- Estilo dinâmico de validação ---------- */
function marcarCampo(campo) {
  if (campo.value === '') {
    campo.classList.remove('campo-valido', 'campo-invalido');
    return;
  }
  const valido = campo.checkValidity();
  campo.classList.toggle('campo-valido', valido);
  campo.classList.toggle('campo-invalido', !valido);
}

/* ---------- Toast ---------- */
let timerToast;
function mostrarToast(mensagem) {
  toast.textContent = mensagem;
  toast.classList.add('show');
  clearTimeout(timerToast);
  timerToast = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ========== EVENTO 1: input (digitação) ========== */
form.addEventListener('input', (e) => {
  const campo = e.target;
  if (mascaras[campo.id]) {
    campo.value = mascaras[campo.id](campo.value);
  }
  if (campo.classList.contains('campo-invalido')) {
    marcarCampo(campo); // corrige o estado assim que o usuário conserta o erro
  }
});

/* ========== EVENTO 2: focusout (saiu do campo) ========== */
form.addEventListener('focusout', (e) => {
  if (e.target.matches('input')) marcarCampo(e.target);
});

/* ========== EVENTO 3: submit (envio do formulário) ========== */
form.addEventListener('submit', (e) => {
  e.preventDefault(); // impede o POST para /enviar-cadastro e o recarregamento

  if (!form.checkValidity()) {
    form.querySelectorAll('input').forEach(marcarCampo);
    alerta.classList.replace('alert-warning', 'alert-danger');
    alerta.querySelector('strong').textContent = 'Erro:';
    form.reportValidity(); // mostra a mensagem nativa no primeiro campo inválido
    return;
  }

  const dados = Object.fromEntries(new FormData(form));
  console.log('Dados do cadastro:', dados); // aqui entraria o fetch(...)

  // Estilo e estado dinâmicos após o sucesso
  badgeStatus.textContent = 'Enviado';
  badgeStatus.classList.replace('badge-warning', 'badge-success');
  badgePasso.textContent = 'Passo 2 de 2';
  alerta.classList.replace('alert-danger', 'alert-warning');
  alerta.hidden = true;

  mostrarToast('Cadastro enviado com sucesso!');
  form.reset();
  form.querySelectorAll('input').forEach((i) =>
    i.classList.remove('campo-valido', 'campo-invalido'));
});

/* ========== EVENTO 4: click em âncoras ========== */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (!link) return;
  if (link.getAttribute('href') === '#') {
    e.preventDefault(); // link placeholder: não rola para o topo nem altera a URL
  }
});