// ==================== Variáveis Globais ====================
let nomes = [], ultimosSorteados = [];

const dom = {
  nomeInput: document.getElementById("nomeInput"),
  btnAdd: document.getElementById("btnAdd"),
  btnLimpar: document.getElementById("btnLimpar"),
  listaNomes: document.getElementById("listaNomes"),
  btnSortear: document.getElementById("btnSortear"),
  quantosNomes: document.getElementById("qtnNomes"),
  btnImportar: document.getElementById("btnImportar"),
  btnExportar: document.getElementById("btnExportar"),
  arquivoInput: document.getElementById("arquivoInput"),
  modal: document.getElementById("resultadoModal"),
  modalTexto: document.getElementById("resultadoTexto"),
  fecharModal: document.getElementById("fecharModal"),
  listaVazia: document.getElementById("listaVazia"),
  ultimosSorteadosLista: document.getElementById("ultimosSorteadosLista"),
  listaVaziaSorteados: document.getElementById("listaVaziaSorteados"),
  selectTheme: document.getElementById("theme")
};

// ==================== Funções de Tema ====================
const aplicarTema = (tema) => {
  document.body.className = "";
  document.body.classList.add(tema);
  localStorage.setItem("temaSelecionado", tema);
};

dom.selectTheme.addEventListener("change", () => aplicarTema(dom.selectTheme.value));

const carregarTemaSalvo = () => {
  const temaSalvo = localStorage.getItem("temaSelecionado") || "unipro";
  dom.selectTheme.value = temaSalvo;
  aplicarTema(temaSalvo);
};

// ==================== LocalStorage ====================
const salvarLocalStorage = () => {
  localStorage.setItem("nomes", JSON.stringify(nomes));
  localStorage.setItem("ultimosSorteados", JSON.stringify(ultimosSorteados));
};

const carregarLocalStorage = () => {
  nomes = JSON.parse(localStorage.getItem("nomes")) || [];
  ultimosSorteados = JSON.parse(localStorage.getItem("ultimosSorteados")) || [];
  atualizarLista();
  atualizarUltimosSorteados();
  carregarTemaSalvo();
};

// ==================== Lista de Nomes ====================
const atualizarLista = () => {
  dom.listaNomes.innerHTML = "";

  nomes.length === 0
    ? dom.listaVazia.style.display = "block"
    : dom.listaVazia.style.display = "none";

  nomes.forEach((nome, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${index + 1}. ${nome}
      <button class="btnExcluir" onclick="removerNome(${index})"></button>
    `;
    dom.listaNomes.appendChild(li);
  });

  salvarLocalStorage();
};

window.removerNome = (index) => {
  nomes.splice(index, 1);
  atualizarLista();
};

const adicionarNome = () => {
  const novoNome = dom.nomeInput.value.trim();
  if (!novoNome) return alert("Por favor, digite um nome válido!");
  nomes.push(novoNome);
  dom.nomeInput.value = "";
  atualizarLista();
};

const limparLista = () => {
  if (confirm("Tem certeza que deseja limpar a lista?")) {
    nomes = [];
    ultimosSorteados = [];
    atualizarLista();
    atualizarUltimosSorteados();
    localStorage.removeItem("nomes");
    localStorage.removeItem("ultimosSorteados");
  }
};


dom.modal.style.display = "none";

// ==================== Sorteio ====================
const sortearNomes = () => {
  if (nomes.length === 0) return alert("A lista de nomes está vazia!");

  let quantidade = parseInt(dom.quantosNomes.value);
  if (isNaN(quantidade) || quantidade < 1) quantidade = 1;
  if (quantidade > nomes.length) quantidade = nomes.length;

  let passo = 0;
  const maxPassos = 20;
  const delayInicial = 100;
  const nomesTemp = [...nomes];
  const sorteados = [];

  const animar = () => {
    if (passo < maxPassos) {
      const nomeAleatorio = nomesTemp[Math.floor(Math.random() * nomesTemp.length)];
      dom.modalTexto.textContent = `🎲 Sorteando: ${nomeAleatorio}...`;
      passo++;
      setTimeout(animar, delayInicial + passo * 15);
    } else {
      const embaralhados = nomesTemp.sort(() => Math.random() - 0.5);
      for (let i = 0; i < quantidade; i++) {
        sorteados.push(embaralhados[i]);
        const idx = nomes.indexOf(embaralhados[i]);
        if (idx !== -1) nomes.splice(idx, 1); // Remove só uma ocorrência
      }
      ultimosSorteados.unshift(...sorteados);
      atualizarLista();
      atualizarUltimosSorteados();
      dom.modalTexto.textContent = `${sorteados.join(", ")}`;
    }
  };

  dom.modal.style.display = "flex";
  dom.modalTexto.textContent = "Preparando o sorteio...";
  setTimeout(animar, 50);
};

// ==================== Últimos Sorteados ====================
const atualizarUltimosSorteados = () => {
  dom.ultimosSorteadosLista.innerHTML = "";

  ultimosSorteados.length === 0
    ? dom.listaVaziaSorteados.style.display = "block"
    : dom.listaVaziaSorteados.style.display = "none";

  ultimosSorteados.forEach((nome, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${index + 1}. ${nome}
      <button class="btnExcluir" onclick="removerUltimoSorteado(${index})"></button>
    `;
    dom.ultimosSorteadosLista.appendChild(li);
  });

  salvarLocalStorage();
};

window.removerUltimoSorteado = (index) => {
  ultimosSorteados.splice(index, 1);
  atualizarUltimosSorteados();
};

// ==================== Importa/Exporta ====================
const importarNomes = () => dom.arquivoInput.click();

const processarArquivoImportado = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const conteudo = e.target.result;
    const novosNomes = conteudo.includes(",")
      ? conteudo.split(",").map(n => n.trim())
      : conteudo.split("\n").map(n => n.trim());
    nomes.push(...novosNomes.filter(n => n));
    atualizarLista();
  };
  reader.readAsText(file);
};

const exportarNomes = () => {
  const conteudo = nomes.join("\n");
  const blob = new Blob([conteudo], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "lista_nomes.txt";
  a.click();
  URL.revokeObjectURL(url);
};

// ==================== Eventos ====================
window.onload = carregarLocalStorage;
dom.btnAdd.addEventListener("click", adicionarNome);
dom.btnLimpar.addEventListener("click", limparLista);
dom.btnSortear.addEventListener("click", sortearNomes);
dom.nomeInput.addEventListener("keyup", (e) => e.key === "Enter" && adicionarNome());
dom.quantosNomes.addEventListener("keyup", (e) => e.key === "Enter" && sortearNomes());
dom.btnImportar.addEventListener("click", importarNomes);
dom.arquivoInput.addEventListener("change", processarArquivoImportado);
dom.btnExportar.addEventListener("click", exportarNomes);
dom.fecharModal.addEventListener("click", () => dom.modal.style.display = "none");
window.addEventListener("click", (e) => e.target === dom.modal && (dom.modal.style.display = "none"));
