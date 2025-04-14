// ==================== Variáveis Globais ====================
let nomes = [];

const dom = {
  nomeInput: document.getElementById("nomeInput"),
  btnAdd: document.getElementById("btnAdd"),
  btnLimpar: document.getElementById("btnLimpar"),
  listaNomes: document.getElementById("listaNomes"),
  btnSortear: document.getElementById("btnSortear"),
  resultado: document.getElementById("resultado"),
  quantosNomes: document.getElementById("quantosNomes"),
  btnImportar: document.getElementById("btnImportar"),
  btnExportar: document.getElementById("btnExportar"),
  arquivoInput: document.getElementById("arquivoInput")
};

// ==================== Funções ====================

const salvarLocalStorage = () => {
  localStorage.setItem("nomes", JSON.stringify(nomes));
};

const carregarLocalStorage = () => {
  const salvos = localStorage.getItem("nomes");
  if (salvos) {
    nomes = JSON.parse(salvos);
    atualizarLista();
  }
};

const atualizarLista = () => {
  dom.listaNomes.innerHTML = "";

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
    atualizarLista();
    dom.resultado.textContent = "Resultado aparecerá aqui...";
    localStorage.removeItem("nomes");
  }
};

const sortearNomes = () => {
  if (nomes.length === 0) return alert("A lista de nomes está vazia!");

  let quantidade = parseInt(dom.quantosNomes.value) || 1;
  quantidade = Math.min(quantidade, nomes.length);

  let passo = 0;
  const maxPassos = 20;
  const delayInicial = 100;
  const nomesTemp = [...nomes];
  const sorteados = [];

  const animar = () => {
    if (passo < maxPassos) {
      const nomeAleatorio = nomesTemp[Math.floor(Math.random() * nomesTemp.length)];
      dom.resultado.textContent = `Sorteando: ${nomeAleatorio}...`;
      passo++;
      setTimeout(animar, delayInicial + passo * 15);
    } else {
      const embaralhados = nomesTemp.sort(() => Math.random() - 0.5);
      sorteados.push(...embaralhados.slice(0, quantidade));
      nomes = nomes.filter((nome) => !sorteados.includes(nome));
      atualizarLista();
      dom.resultado.textContent = `🎉 Nomes sorteados: ${sorteados.join(", ")}`;
    }
  };

  animar();
};

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

dom.nomeInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") adicionarNome();
});

dom.quantosNomes.addEventListener("keyup", (e) => {
  if (e.key === "Enter") sortearNomes();
});

dom.btnImportar.addEventListener("click", importarNomes);
dom.arquivoInput.addEventListener("change", processarArquivoImportado);
dom.btnExportar.addEventListener("click", exportarNomes);
