new Vue({
  beforeDestroy() {
  window.removeEventListener("keydown", this.teclasForm);
},
  el:"#app",
  data:{
    wish_site: '',
    somenteFavoritos:false,
    nome:'', marca:'', imagem:'', volume:'', ano:'', preco:'',
    ocasiões:[], tempo:'', estacao:'', notasSelecionadas:[],
    extras:'', site:'', filtroGeral:'',
    opcoesOcasiões:["Dia a Dia","Profissional","Balada","Encontro","Faculdade","Academia","Casamento","Happy Hour"],
    opcoesNotasAromaticas:["Amadeirado","Cítrico","Doce","Fresco","Oriental","Especiado","Aquático / Marinho","Aromático","Frutado","Herbal"],
    listaPerfumes:[],
    abasAbertas:{ oc:false, pref:false, notas:false },
    editIndex:null,
    tela: 'grid',
    notaTemp:0,
    sortBy:'none',
    wishlist: [],
    wish_nome: '',
    wish_marca: '',
    wish_preco: '',
    wish_imagem: '',
  },
  mounted(){
    const saveWish = localStorage.getItem("wishlist");
    if (saveWish) this.wishlist = JSON.parse(saveWish);

    const save = localStorage.getItem("perfumes");
    if(save) this.listaPerfumes = JSON.parse(save);
    window.addEventListener("keydown", this.teclasForm);
  },
  watch:{
    listaPerfumes:{
    deep:true,
    handler(v){
      // ESTE É O COMANDO QUE SALVA NO NAVEGADOR
      localStorage.setItem("perfumes", JSON.stringify(v));
    }
  },

  tela(newVal) {
    if (newVal === 'grid') {
      this.resetar();
    }
  },
wishlist:{
  deep:true,
  handler(v){
    localStorage.setItem("wishlist", JSON.stringify(v));
  }
},
  },
  computed:{
    valorTotal(){ 
      return this.listaFiltrada.reduce((t,p)=>t+parseFloat(p.preco||0),0); 
    },
listaFiltrada() {
  const termos = this.filtroGeral
    .toLowerCase()
    .split(" ")
    .filter(t => t.trim() !== "");

  let listaBase = this.listaPerfumes;

  // 🔥 Se favoritos estiver ativado, filtra primeiro
  if (this.somenteFavoritos) {
    listaBase = listaBase.filter(p => p.favorito);
  }

  // 🔥 Se não digitou nada, retorna só os favoritos (ou todos)
  if (termos.length === 0) {
    return listaBase;
  }

  // 🔍 Busca inteligente (todas as palavras devem bater)
  return listaBase.filter(perfume => {
    const texto = `
      ${perfume.nome}
      ${perfume.marca}
      ${perfume.preco}
      ${perfume.volume}
      ${perfume.ano}
      ${perfume.tempo}
      ${perfume.estacao}
      ${perfume.extras}
      ${perfume.ocasiões.join(" ")}
      ${perfume.notasSelecionadas.join(" ")}
    `.toLowerCase();

    return termos.every(t => texto.includes(t));
  });
},
    listaFiltradaSorted(){
      const arr=this.listaFiltrada.slice();
      switch(this.sortBy){
        case 'nome_az': arr.sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR')); break;
        case 'nome_za': arr.sort((a,b)=>b.nome.localeCompare(a.nome,'pt-BR')); break;
        case 'preco_cresc': arr.sort((a,b)=>a.preco-b.preco); break;
        case 'preco_desc': arr.sort((a,b)=>b.preco-a.preco); break;
        case 'nota_cresc': arr.sort((a,b)=>a.nota-b.nota); break;
        case 'nota_desc': arr.sort((a,b)=>b.nota-a.nota); break;
      }
      return arr;
    },
    podeSalvar(){
      return this.nome && this.marca && this.imagem && this.volume &&
             this.preco && this.site;
    },
    temAlgoNoFormulario() {
  return this.nome || this.marca || this.imagem || this.volume || this.ano ||
         this.preco || this.ocasiões.length || this.notasSelecionadas.length ||
         this.tempo || this.estacao || this.extras || this.site;
}

  },
  filters:{
    reais(v){ return "R$ "+parseFloat(v).toFixed(2).replace(".",","); }
  },
  methods:{
  
    toggleAba(a){ this.abasAbertas[a]=!this.abasAbertas[a]; },
teclasForm(e) {
  // ========= CADASTRO =========
  if (this.tela === 'cadastro') {
    // ESC → cancelar e voltar para lista
    if (e.key === "Escape") {
      this.cancelarEdicao();
      this.tela = "grid";
    }

    // ENTER → salvar
    if (e.key === "Enter") {
      e.preventDefault();
      if (this.podeSalvar) {
        this.cadastrarPerfume();
      }
    }
  }

  // ========= WISHLIST =========
  if (this.tela === 'wishlist') {

    // ESC → limpar e voltar para grid
    if (e.key === "Escape") {
      this.wish_nome = '';
      this.wish_marca = '';
      this.wish_preco = '';
      this.wish_imagem = '';
      this.wish_site = '';
      this.tela = 'grid';
    }

    // ENTER → adicionar à wishlist
    if (e.key === "Enter") {
      e.preventDefault();
      this.wishAdicionar();
    }
  }
},
cadastrarPerfume() {
  let fav = false;

  if (this.editIndex !== null)
    fav = this.listaPerfumes[this.editIndex].favorito;

  const perfume = {
    nome: this.nome,
    marca: this.marca,
    imagem: this.imagem,
    volume: this.volume,
    ano: this.ano,
    preco: this.preco,
    ocasiões: [...this.ocasiões],
    tempo: this.tempo,
    estacao: this.estacao,
    notasSelecionadas: [...this.notasSelecionadas],
    extras: this.extras,
    site: this.site,
    expandido: false,
    nota: this.editIndex !== null ? this.notaTemp : 0,
    favorito: fav
  };

  if (this.editIndex !== null)
    Vue.set(this.listaPerfumes, this.editIndex, perfume);
  else
    this.listaPerfumes.push(perfume);

  this.resetar();
  this.tela = 'grid';
},
irParaLista() {
  this.resetar();        // limpa antes
  this.tela = 'grid';    // muda depois
},

irParaCadastro() {
  this.resetar();        // sempre começa vazio
  this.tela = 'cadastro';
},

abrirImportacao() {
  document.getElementById("importarArquivo").click();
},

alterar(perfume) {
  const indexReal = this.listaPerfumes.indexOf(perfume);

  const p = this.listaPerfumes[indexReal];

  this.tela = 'cadastro';
  this.nome = p.nome;
  this.marca = p.marca;
  this.imagem = p.imagem;
  this.volume = p.volume;
  this.ano = p.ano;
  this.preco = p.preco;
  this.ocasiões = [...p.ocasiões];
  this.tempo = p.tempo;
  this.estacao = p.estacao;
  this.notasSelecionadas = [...p.notasSelecionadas];
  this.extras = p.extras;
  this.site = p.site;

  this.notaTemp = p.nota;
  this.editIndex = indexReal;
},
// Carregar via input file
carregarImagem(event) {
  const file = event.target.files[0];
  if (file) this.lerArquivo(file);
},

// Soltar arquivo (drag and drop)
soltarImagem(event) {
  const file = event.dataTransfer.files[0];
  if (file) this.lerArquivo(file);
},

// Colar imagem (CTRL+V)
colarImagem(event) {
  const items = event.clipboardData.items;

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.includes("image")) {
      const file = items[i].getAsFile();
      this.lerArquivo(file);
      break;
    }
  }
},

// Lê qualquer imagem e converte para Base64
lerArquivo(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    this.imagem = e.target.result; // Base64
  };
  reader.readAsDataURL(file);
},

duplicar(perfume) {
  const indexReal = this.listaPerfumes.indexOf(perfume);

  const clone = JSON.parse(JSON.stringify(this.listaPerfumes[indexReal]));
  clone.expandido = false;
  clone.favorito = false;

  this.listaPerfumes.push(clone);

  this.alterar(clone);
},

cancelarEdicao(){
   this.resetar(); 
   this.tela = 'grid';
},

resetar(){
  this.nome=this.marca=this.imagem=this.volume=this.ano=this.preco='';
  this.ocasiões=[]; 
  this.tempo=''; 
  this.estacao='';
  this.notasSelecionadas=[]; 
  this.extras=''; 
  this.site='';
  this.editIndex=null; 
  this.notaTemp=0;
  this.abasAbertas={oc:false,pref:false,notas:false};
},

excluir(perfume) {
  if (!confirm("Tem certeza que deseja excluir este perfume?")) return;

  const indexReal = this.listaPerfumes.indexOf(perfume);
  this.listaPerfumes.splice(indexReal, 1);
},

toggleExpand(p){
  const aberto=p.expandido;
  this.listaPerfumes.forEach(x=>x.expandido=false);
  p.expandido=!aberto;
},

setNotaPerfume(perfume, n) {
  const indexReal = this.listaPerfumes.indexOf(perfume);
  if (indexReal !== -1) {
    this.listaPerfumes[indexReal].nota = n;
    this.notaTemp = n;
  }
},


toggleFavorito(p){ p.favorito=!p.favorito; },

badgeColorOc(o){
  return {
    "Dia a Dia":"primary","Profissional":"dark","Balada":"purple",
    "Encontro":"red","Faculdade":"green","Academia":"orange",
    "Casamento":"yellow","Happy Hour":"cyan"
  }[o] || "secondary";
},

exportarColecaoCompleta() {

    if (!confirm("Deseja realmente exportar toda a coleção e lista de desejos?")) {
        return;
    }

    const dados = {
        colecao: this.listaPerfumes,
        wishlist: this.wishlist
    };

    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "colecao_completa.json";
    a.click();

    URL.revokeObjectURL(url);

    alert("Coleção exportada com sucesso!");
},

importarColecaoCompleta(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const dados = JSON.parse(e.target.result);

            const colecaoImportada = dados.colecao || [];
            const wishlistImportada = dados.wishlist || [];

            this.mesclarPerfumes(colecaoImportada, "listaPerfumes");
            this.mesclarPerfumes(wishlistImportada, "wishlist");

            alert("Coleção importada com sucesso!");

        } catch (erro) {
            alert("Erro ao importar arquivo.");
        }
    };

    reader.readAsText(file);
},

mesclarPerfumes(lista, destino) {
    lista.forEach(p => {
        const existe = this[destino].some(x =>
            x.nome.toLowerCase() === p.nome.toLowerCase() &&
            x.marca.toLowerCase() === p.marca.toLowerCase()
        );

        if (!existe) {
            this[destino].push(p);
        }
    });
},

badgeColorNota(n){
  return{
    "Amadeirado":"brown","Cítrico":"yellow","Doce":"pink",
    "Fresco":"skyblue","Oriental":"red","Especiado":"orange",
    "Aquático / Marinho":"cyan","Aromático":"green",
    "Frutado":"purple","Herbal":"darkgreen"
  }[n] || "secondary";
},
irParaWishlist() {
  this.tela = 'wishlist';
},
wish_carregarImagem(e){
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = r => this.wish_imagem = r.target.result;
  reader.readAsDataURL(file);
},
wishAdicionar(){
  if(!this.wish_nome || !this.wish_marca || !this.wish_preco || !this.wish_imagem){
    alert("Preencha todos os campos!");
    return;
  }

this.wishlist.push({
  nome: this.wish_nome,
  marca: this.wish_marca,
  preco: this.wish_preco,
  imagem: this.wish_imagem,
  site: this.wish_site
});

  this.wish_site = '';
  this.wish_nome = '';
  this.wish_marca = '';
  this.wish_preco = '';
  this.wish_imagem = '';
},
wishMoverParaColecao(p){

  if (!confirm("Deseja mover este perfume para a sua coleção?")) {
    return;
  }

  this.listaPerfumes.push({
    nome: p.nome,
    marca: p.marca,
    preco: p.preco,
    imagem: p.imagem,
    volume: '',
    ano: '',
    site: p.site || '',
    ocasiões: [],
    tempo: '',
    estacao: '',
    notasSelecionadas: [],
    extras: '',
    nota: 0,
    favorito: false,
    expandido: false
  });

  this.wishExcluir(p, false);

  alert("Movido para a coleção!");
},
wishExcluir(p, confirmar = true) {
  if (confirmar && !confirm("Tem certeza que deseja remover este perfume da lista de desejos?")) {
    return;
  }

  const i = this.wishlist.indexOf(p);
  this.wishlist.splice(i, 1);
},
// ====== WISHLIST — Upload de imagem igual ao formulário ======
wish_carregarImagem(event) {
  const file = event.target.files[0];
  if (file) this.wish_lerArquivo(file);
},

wish_soltarImagem(event) {
  const file = event.dataTransfer.files[0];
  if (file) this.wish_lerArquivo(file);
},

wish_colarImagem(event) {
  const items = event.clipboardData.items;

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.includes("image")) {
      const file = items[i].getAsFile();
      this.wish_lerArquivo(file);
      break;
    }
  }
},

wish_lerArquivo(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    this.wish_imagem = e.target.result; // Base64
  };
  reader.readAsDataURL(file);
},
}
});
