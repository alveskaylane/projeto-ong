/* ==========================================================================
   cadastro.js — validação do formulário de cadastro (ONG Renovar)
   Carregar em html/cadastro.html:  <script src="../js/cadastro.js"></script>
   ========================================================================== */

const form = document.querySelector('form');
const badgeStatus = document.querySelector('.badge-warning');
const badgePasso = document.querySelector('.badge-info');
const alerta = document.querySelector('.alert-warning');
const toast = document.querySelector('.toast');

/* ========== MÁSCARAS (texto -> texto formatado) ========== */

const mascaras = {
  cpf: (v) => v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2'),

  // Celular (11 dígitos): (11) 98765-4321 | Fixo (10 dígitos): (11) 2345-6789
  telefone: (v) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length > 10) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    if (d.length > 6) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    if (d.length > 2) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return d;
  },

  cep: (v) => v.replace(/\D/g, '').slice(0, 8)
    .replace(/(\d{5})(\d{1,3})$/, '$1-$2'),

  estado: (v) => v.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase(),
};

/* ========== MENSAGENS DE ERRO ========== */

const mensagens = {
  nome: 'Informe seu nome completo.',
  cpf: 'CPF inválido. Use 000.000.000-00.',
  telefone: 'Informe o telefone com DDD.',
  email: 'Digite um e-mail válido.',
  data_nascimento: 'Informe uma data de nascimento válida.',
  cep: 'CEP inválido. Use 00000-000.',
  endereco: 'Informe o endereço.',
  cidade: 'Informe a cidade.',
  estado: 'Use a sigla com 2 letras.',
};

function textoDoErro(campo) {
  const v = campo.validity;
  if (v.valueMissing) return 'Campo obrigatório.';
  if (v.customError) return campo.validationMessage; // ex.: CPF com dígitos inválidos
  if (v.rangeOverflow) return 'A data não pode ser futura.';
  if (v.rangeUnderflow) return 'Data muito antiga.';
  return mensagens[campo.id] ?? 'Valor inválido.';
}

// Devolve o <span> de erro do campo; cria se não existir no HTML
function obterErro(campo) {
  let erro = document.getElementById(`erro-${campo.id}`);
  if (!erro) {
    erro = document.createElement('span');
    erro.id = `erro-${campo.id}`;
    erro.className = 'error-message';
    erro.setAttribute('role', 'alert');
    campo.insertAdjacentElement('afterend', erro);
    campo.setAttribute('aria-describedby', erro.id);
  }
  return erro;
}

/* ========== REGRAS EXTRAS DE CONSISTÊNCIA ========== */

// Valida os dígitos verificadores do CPF
function cpfValido(cpf) {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;

  const digito = (base) => {
    let soma = 0;
    for (let i = 0; i < base; i++) soma += Number(d[i]) * (base + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(9) === Number(d[9]) && digito(10) === Number(d[10]);
}

// Regras que o HTML5 não cobre: usam setCustomValidity
function aplicarRegrasExtras(campo) {
  if (campo.id === 'cpf') {
    const completo = campo.value.replace(/\D/g, '').length === 11;
    campo.setCustomValidity(
      completo && !cpfValido(campo.value) ? 'CPF inválido: dígitos verificadores não conferem.' : ''
    );
  }
}

// Data de nascimento: não aceita futuro nem datas absurdas
const campoData = document.getElementById('data_nascimento');
if (campoData) {
  campoData.max = new Date().toISOString().split('T')[0];
  campoData.min = '1900-01-01';
}

/* ========== NOTIFICAÇÃO VISUAL DO CAMPO ========== */

function limparCampo(campo) {
  campo.classList.remove('campo-valido', 'campo-invalido');
  campo.removeAttribute('aria-invalid');
  const erro = document.getElementById(`erro-${campo.id}`);
  if (erro) erro.textContent = '';
}

function marcarCampo(campo) {
  aplicarRegrasExtras(campo);

  // Campo opcional e vazio: nada a mostrar
  if (campo.value === '' && !campo.required) {
    limparCampo(campo);
    return;
  }

  const valido = campo.checkValidity();
  const vazio = campo.value === '';

  campo.classList.toggle('campo-valido', valido && !vazio);
  campo.classList.toggle('campo-invalido', !valido);
  campo.setAttribute('aria-invalid', String(!valido));

  obterErro(campo).textContent = valido ? '' : textoDoErro(campo);
}

/* ========== TOAST ========== */

let timerToast;
function mostrarToast(mensagem) {
  toast.textContent = mensagem;
  toast.classList.add('show');
  clearTimeout(timerToast);
  timerToast = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ========== ALERTA GERAL DO FORMULÁRIO ========== */

function alertaModoErro() {
  alerta.classList.remove('alert-warning');
  alerta.classList.add('alert-danger');
  alerta.querySelector('strong').textContent = 'Erro:';
}

function alertaModoNormal() {
  alerta.classList.remove('alert-danger');
  alerta.classList.add('alert-warning');
  alerta.querySelector('strong').textContent = 'Atenção:';
}

/* ========== VIACEP (preenche endereço a partir do CEP) ========== */

async function buscarCep(campoCep) {
  const cep = campoCep.value.replace(/\D/g, '');
  if (cep.length !== 8) return;

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!resposta.ok) throw new Error('Falha na consulta');
    const dados = await resposta.json();

    if (dados.erro) {
      campoCep.setCustomValidity('CEP não encontrado.');
      marcarCampo(campoCep);
      return;
    }

    campoCep.setCustomValidity('');
    marcarCampo(campoCep);

    const preencher = (id, valor) => {
      const campo = document.getElementById(id);
      if (campo && valor) {
        campo.value = valor;
        marcarCampo(campo);
      }
    };

    // O usuário ainda completa o número/complemento depois da vírgula
    const rua = [dados.logradouro, dados.bairro].filter(Boolean).join(' - ');
    preencher('endereco', rua ? `${rua}, ` : '');
    preencher('cidade', dados.localidade);
    preencher('estado', dados.uf);

    document.getElementById('endereco')?.focus();
  } catch {
    // Sem internet ou API fora do ar: o usuário preenche manualmente
    mostrarToast('Não foi possível buscar o CEP. Preencha o endereço manualmente.');
  }
}

/* ========== EVENTO 1: input (digitação) ========== */

form.addEventListener('input', (e) => {
  const campo = e.target;
  if (!campo.matches('input')) return;

  if (mascaras[campo.id]) {
    campo.value = mascaras[campo.id](campo.value);
  }

  // CEP editado: descarta o erro "não encontrado" da consulta anterior
  if (campo.id === 'cep') campo.setCustomValidity('');

  // Se já estava marcado como inválido, reavalia em tempo real
  if (campo.classList.contains('campo-invalido')) {
    marcarCampo(campo);
  }
});

/* ========== EVENTO 2: focusout (saiu do campo) ========== */

form.addEventListener('focusout', (e) => {
  if (!e.target.matches('input')) return;
  marcarCampo(e.target);
  if (e.target.id === 'cep' && e.target.checkValidity()) buscarCep(e.target);
});

/* ========== EVENTO 3: submit (envio) ========== */

form.addEventListener('submit', (e) => {
  e.preventDefault(); // impede o POST e o recarregamento

  const campos = form.querySelectorAll('input');
  campos.forEach(aplicarRegrasExtras);

  if (!form.checkValidity()) {
    campos.forEach(marcarCampo);
    alerta.hidden = false;
    alertaModoErro();
    form.querySelector('.campo-invalido')?.focus();
    return;
  }

  const dados = Object.fromEntries(new FormData(form));
  console.log('Dados do cadastro:', dados); // aqui entraria o fetch(...)

  // Estado dinâmico após o sucesso
  badgeStatus.textContent = 'Enviado';
  badgeStatus.classList.replace('badge-warning', 'badge-success');
  badgePasso.textContent = 'Passo 2 de 2';
  alertaModoNormal();
  alerta.hidden = true;

  mostrarToast('Cadastro enviado com sucesso!');
  form.reset();
  campos.forEach(limparCampo);
});

/* ========== EVENTO 4: reset (limpa marcações visuais) ========== */

form.addEventListener('reset', () => {
  form.querySelectorAll('input').forEach((campo) => {
    campo.setCustomValidity('');
    limparCampo(campo);
  });
});