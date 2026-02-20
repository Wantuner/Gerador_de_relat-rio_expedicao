/* ==========================
   SUPABASE
========================== */
const supabaseUrl = 'https://tljfrgxcplqfzxxilriw.supabase.co';
const supabaseKey = 'sb_publishable_KNzNTWkUthMHca4_jfKzNw_rUYvbFtl';

const supabaseClient = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

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

const listaNotas = document.getElementById("listaNotas");
const toast = document.getElementById("toast");

let notas = [];
let editId = null;

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

/* ==========================
   RENDER
========================== */
function criarLinha(label, valor) {
  const div = document.createElement("div");

  const strong = document.createElement("strong");
  strong.textContent = label + " ";

  const span = document.createElement("span");
  span.textContent = valor;

  div.appendChild(strong);
  div.appendChild(span);

  return div;
}

function render() {
  listaNotas.innerHTML = "";

  notas.forEach(n => {
    const card = document.createElement("div");
    card.className = "nota-card";
    if (n.expedido) card.classList.add("expedido");

    const nome = document.createElement("strong");
    nome.textContent = n.cliente;

    const data = document.createElement("div");
    data.className = "data-nota";
    data.textContent = "📅 " + new Date(n.created_at).toLocaleDateString("pt-BR");

    const valor = document.createElement("div");
    valor.className = "valor";
    valor.textContent = formatarMoeda(n.valor);

    const acoes = document.createElement("div");
    acoes.className = "nota-acoes";

    if (!n.expedido) {
      const btnEditar = document.createElement("button");
      btnEditar.textContent = "✏️";
      btnEditar.onclick = () => editar(n.id);

      const btnExcluir = document.createElement("button");
      btnExcluir.textContent = "🗑️";
      btnExcluir.onclick = () => excluir(n.id);

      acoes.appendChild(btnEditar);
      acoes.appendChild(btnExcluir);
    }

    const btnExpedir = document.createElement("button");
    btnExpedir.className = "btn-expedir";
    btnExpedir.textContent = n.expedido ? "✅ EXPEDIDO" : "🚚 EXPEDIR";
    btnExpedir.onclick = () => alternarExpedido(n.id, n.expedido);

    acoes.appendChild(btnExpedir);

    card.appendChild(nome);
    card.appendChild(data);
    card.appendChild(criarLinha("NF:", n.nf));
    card.appendChild(criarLinha("Pedido:", n.pedido));
    card.appendChild(criarLinha("Volumes:", n.volumes));
    card.appendChild(criarLinha("Caixa:", n.caixa));
    card.appendChild(valor);
    card.appendChild(acoes);

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
carregarNotas();
