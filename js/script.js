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

let notas = JSON.parse(localStorage.getItem("notas")) || [];
let editId = null;

/* ==========================
   FORMATADOR DE MOEDA (BR)
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
   LIMPAR FORMULÁRIO
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
   RENDERIZAR NOTAS
========================== */
function render() {
  listaNotas.innerHTML = "";

  notas.forEach(n => {
    const card = document.createElement("div");
    card.className = "nota-card";

    const dataFormatada = new Date(n.data).toLocaleDateString("pt-BR");

    card.innerHTML = `
      <strong>${n.cliente}</strong>
      <div class="data-nota">📅 ${dataFormatada}</div>
      <div>NF: ${n.nf}</div>
      <div>Pedido: ${n.pedido}</div>
      <div>Volumes: ${n.volumes}</div>
      <div>Caixa: ${n.caixa}</div>
      <div class="valor">${formatarMoeda(n.valor)}</div>

      <div class="nota-acoes">
        <button onclick="editar(${n.id})">✏️</button>
        <button onclick="excluir(${n.id})">🗑️</button>
      </div>
    `;

    listaNotas.appendChild(card);
  });
}

/* ==========================
   ADICIONAR / EDITAR NOTA
========================== */
btnAdicionar.onclick = () => {

  if (!cliente.value || !nf.value || !pedido.value || !volumes.value || !valor.value || !caixa.value) {
    mostrarToast("Preencha todos os campos", "aviso");
    return;
  }

  if (notas.some(n => (n.nf === nf.value || n.pedido === pedido.value) && n.id !== editId)) {
    mostrarToast("Nota Fiscal ou Pedido já existente", "erro");
    return;
  }

  if (editId) {
    const nota = notas.find(n => n.id === editId);
    Object.assign(nota, {
      cliente: cliente.value,
      nf: nf.value,
      pedido: pedido.value,
      volumes: volumes.value,
      valor: Number(valor.value),
      caixa: caixa.value
    });
    editId = null;
  } else {
    notas.push({
      id: Date.now(),
      cliente: cliente.value,
      nf: nf.value,
      pedido: pedido.value,
      volumes: volumes.value,
      valor: Number(valor.value),
      caixa: caixa.value,
      data: new Date().toISOString()
    });
  }

  localStorage.setItem("notas", JSON.stringify(notas));
  render();
  mostrarToast("Nota salva com sucesso", "sucesso");
  btnLimpar.click();
};

/* ==========================
   EDITAR NOTA
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
   EXCLUIR NOTA
========================== */
window.excluir = (id) => {
  notas = notas.filter(n => n.id !== id);
  localStorage.setItem("notas", JSON.stringify(notas));
  render();
  mostrarToast("Nota excluída", "aviso");
};

/* ==========================
   GERAR PDF
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
      new Date(n.data).toLocaleDateString("pt-BR"),
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
   INICIALIZA
========================== */
render();
