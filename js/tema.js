/* ==========================================================================
   tema.js — alternância entre modo claro e escuro
   Script CLÁSSICO carregado no <head>: precisa rodar antes da página ser
   desenhada para evitar o "flash" de tema errado (por isso não é ES Module).
   Ordem de decisão: preferência salva > preferência do sistema operacional.
   ========================================================================== */

(() => {
  const CHAVE = 'ong-renovar:tema'; // 'claro' | 'escuro'
  const raiz = document.documentElement;
  const consulta = window.matchMedia('(prefers-color-scheme: dark)');

  let botao;
  let icone;

  function lerSalvo() {
    try {
      const tema = localStorage.getItem(CHAVE);
      return tema === 'claro' || tema === 'escuro' ? tema : null;
    } catch {
      return null; // storage bloqueado (modo privado, política do navegador)
    }
  }

  function salvar(tema) {
    try {
      localStorage.setItem(CHAVE, tema);
    } catch {
      /* sem persistência: o tema vale só nesta visita */
    }
  }

  function temaEfetivo() {
    return lerSalvo() ?? (consulta.matches ? 'escuro' : 'claro');
  }

  function aplicar(tema) {
    raiz.setAttribute('data-tema', tema);
    if (botao) {
      botao.setAttribute('aria-pressed', String(tema === 'escuro'));
      icone.textContent = tema === 'escuro' ? '☀️' : '🌙';
    }
  }

  function criarBotao() {
    botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'tema-toggle';

    icone = document.createElement('span');
    icone.setAttribute('aria-hidden', 'true'); // decorativo: o texto já diz tudo

    const rotulo = document.createElement('span');
    rotulo.textContent = 'Modo escuro'; // rótulo fixo; o estado vai em aria-pressed

    botao.append(icone, rotulo);
    botao.addEventListener('click', () => {
      const novo = raiz.getAttribute('data-tema') === 'escuro' ? 'claro' : 'escuro';
      salvar(novo);
      aplicar(novo);
    });

    document.body.append(botao);
    aplicar(raiz.getAttribute('data-tema'));
  }

  // 1) Imediato (ainda no <head>): aplica o tema antes da primeira pintura
  aplicar(temaEfetivo());

  // 2) Quando o DOM existir: injeta o botão (funciona em todas as páginas)
  document.addEventListener('DOMContentLoaded', criarBotao);

  // 3) Sem escolha do usuário, acompanha mudanças do sistema operacional
  consulta.addEventListener?.('change', () => {
    if (!lerSalvo()) aplicar(temaEfetivo());
  });
})();