/* ==========================
   SUPABASE
========================== */
const supabaseClient = window.supabaseClient;

/* ==========================
   ELEMENTOS
========================== */
const cliente = document.getElementById("cliente");
const nf = document.getElementById("nf");
const pedido = document.getElementById("pedido");
const volumes = document.getElementById("volumes");
const valor = document.getElementById("valor");
const caixa = document.getElementById("caixa");

const btnAdicionar = document.getElementById("btnAdicionar");
const btnLimpar = document.getElementById("btnLimpar");
const btnPDF = document.getElementById("btnPDF");
const btnLogout = document.getElementById("btnLogout");
const usuarioLogado = document.getElementById("usuarioLogado");

const listaNotas = document.getElementById("listaNotas");
const toast = document.getElementById("toast");

let notas = [];
let editId = null;

/* ==========================
   AUTH GUARD
========================== */
async function validarSessao() {
  const { data, error } = await supabaseClient.auth.getSession();
  if (error || !data.session) {
    window.location.href = "login.html";
    return null;
  }
  return data.session;
}

function obterNomeExibicao(user) {
  const email = user?.email || "";
  if (email.includes("@")) return email.split("@")[0];
  return "Usuario";
}

function calcularDiasNaExpedicao(dataCriacao) {
  const hoje = new Date();
  const dataNota = new Date(dataCriacao);

  const hojeZerado = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const dataNotaZerada = new Date(dataNota.getFullYear(), dataNota.getMonth(), dataNota.getDate());
  const diferencaMs = hojeZerado - dataNotaZerada;
  const dias = Math.max(0, Math.floor(diferencaMs / 86400000));

  if (dias === 0) return "Hoje na expedição";
  if (dias === 1) return "1 dia na expedição";
  return `${dias} dias na expedição`;
}

/* ==========================
   FORMATADOR DE MOEDA
========================== */
const formatarMoeda = (valor) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(valor);
};

/* ==========================
   TOAST
========================== */
function mostrarToast(msg, tipo) {
  toast.textContent = msg;
  toast.className = "";
  toast.classList.add("show", tipo);
  setTimeout(() => toast.classList.remove("show"), 3000);
}

/* ==========================
   LIMPAR FORM
========================== */
btnLimpar.onclick = () => {
  cliente.value = "";
  nf.value = "";
  pedido.value = "";
  volumes.value = "";
  valor.value = "";
  caixa.value = "";
  editId = null;
};

if (btnLogout) {
  btnLogout.onclick = async () => {
    await supabaseClient.auth.signOut();
    window.location.href = "login.html";
  };
}

/* ==========================
   RENDER
========================== */
function render() {
  listaNotas.innerHTML = "";

  notas.forEach(n => {
    const card = document.createElement("div");
    card.className = "nota-card";
    if (n.expedido) card.classList.add("expedido");

    const dataFormatada = new Date(n.created_at).toLocaleDateString("pt-BR");
    const diasNaExpedicao = calcularDiasNaExpedicao(n.created_at);

    card.innerHTML = `
      <strong>${n.cliente}</strong>
      <div class="data-nota">📅 ${dataFormatada}</div>
      <div><strong>NF:</strong> ${n.nf}</div>
      <div><strong>Pedido:</strong> ${n.pedido}</div>
      <div><strong>Volumes:</strong> ${n.volumes}</div>
      <div><strong>Caixa:</strong> ${n.caixa}</div>
      <div class="valor">${formatarMoeda(n.valor)}</div>
      <div class="tempo-expedicao">${diasNaExpedicao}</div>

      <div class="nota-acoes">
        ${
          !n.expedido
            ? `
              <button onclick="editar(${n.id})">✏️</button>
              <button onclick="excluir(${n.id})">🗑️</button>
            `
            : ""
        }

       <button class="btn-expedir" onclick="alternarExpedido(${n.id}, ${n.expedido})">
         ${n.expedido ? "✅ EXPEDIDO" : "🚚 EXPEDIR"}
       </button>

      </div>
    `;

    listaNotas.appendChild(card);
  });
}

/* ==========================
   CARREGAR NOTAS
========================== */
async function carregarNotas() {
  const { data, error } = await supabaseClient
    .from('relatorios_expedicao')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    mostrarToast("Erro ao carregar notas", "erro");
    return;
  }

  notas = data;
  render();
}

/* ==========================
   ADICIONAR / EDITAR
========================== */
btnAdicionar.onclick = async () => {
  if (!cliente.value || !nf.value || !pedido.value || !volumes.value || !valor.value || !caixa.value) {
    mostrarToast("Preencha todos os campos", "aviso");
    return;
  }

  if (notas.some(n => (n.nf === nf.value || n.pedido === pedido.value) && n.id !== editId)) {
    mostrarToast("Nota Fiscal ou Pedido já existente", "erro");
    return;
  }

  if (editId) {
    const { error } = await supabaseClient
      .from('relatorios_expedicao')
      .update({
        cliente: cliente.value,
        nf: nf.value,
        pedido: pedido.value,
        volumes: volumes.value,
        valor: Number(valor.value),
        caixa: caixa.value
      })
      .eq('id', editId);

    if (error) {
      console.error(error);
      mostrarToast("Erro ao atualizar nota", "erro");
      return;
    }

    mostrarToast("Nota atualizada", "sucesso");
    editId = null;
  } else {
    const { error } = await supabaseClient
      .from('relatorios_expedicao')
      .insert([{
        cliente: cliente.value,
        nf: nf.value,
        pedido: pedido.value,
        volumes: volumes.value,
        valor: Number(valor.value),
        caixa: caixa.value,
        expedido: false
      }]);

    if (error) {
      console.error(error);
      mostrarToast("Erro ao salvar nota", "erro");
      return;
    }

    mostrarToast("Nota salva com sucesso", "sucesso");
  }

  btnLimpar.click();
  carregarNotas();
};

/* ==========================
   EDITAR
========================== */
window.editar = (id) => {
  const n = notas.find(n => n.id === id);
  cliente.value = n.cliente;
  nf.value = n.nf;
  pedido.value = n.pedido;
  volumes.value = n.volumes;
  valor.value = n.valor;
  caixa.value = n.caixa;
  editId = id;
};

/* ==========================
   EXCLUIR
========================== */
window.excluir = async (id) => {
  const confirmar = confirm("Deseja realmente excluir esta nota?");
  if (!confirmar) return;

  const { error } = await supabaseClient
    .from('relatorios_expedicao')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(error);
    mostrarToast("Erro ao excluir nota", "erro");
    return;
  }

  mostrarToast("Nota excluída", "aviso");
  carregarNotas();
};

/* ==========================
   EXPEDIR (TOGGLE)
========================== */
window.alternarExpedido = async (id, estadoAtual) => {
  const { error } = await supabaseClient
    .from("relatorios_expedicao")
    .update({ expedido: !estadoAtual })
    .eq("id", id);

  if (error) {
    console.error(error);
    mostrarToast("Erro ao atualizar expedição", "erro");
    return;
  }

  mostrarToast(
    !estadoAtual ? "Nota expedida 🚚" : "Expedição desfeita",
    "sucesso"
  );

  carregarNotas();
};

/* ==========================
   PDF
========================== */
btnPDF.onclick = () => {
  if (!notas.length) {
    mostrarToast("Nenhuma nota para gerar PDF", "aviso");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Relatório de Expedição", 14, 16);
  doc.text(`Data de emissão: ${new Date().toLocaleDateString("pt-BR")}`, 14, 22);

  doc.autoTable({
    startY: 30,
    head: [["Cliente", "Data", "NF", "Pedido", "Volumes", "Caixa", "Valor"]],
    body: notas.map(n => [
      n.cliente,
      new Date(n.created_at).toLocaleDateString("pt-BR"),
      n.nf,
      n.pedido,
      n.volumes,
      n.caixa,
      formatarMoeda(n.valor)
    ])
  });

  doc.save("relatorio-expedicao.pdf");
};

/* ==========================
   INIT
========================== */
(async () => {
  const session = await validarSessao();
  if (!session) return;

  if (usuarioLogado) {
    usuarioLogado.textContent = obterNomeExibicao(session.user);
  }

  carregarNotas();
})();

/* ==========================
   REALTIME SUPABASE
========================== */
supabaseClient
  .channel('realtime-notas')
  .on(
    'postgres_changes',
    {
      event: '*', // INSERT | UPDATE | DELETE
      schema: 'public',
      table: 'relatorios_expedicao'
    },
    payload => {
      console.log("Mudança detectada:", payload);
      carregarNotas(); // recarrega lista
    }
  )
  .subscribe();
