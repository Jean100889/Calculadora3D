(function () {
    var todos = [];
    var produtoEmEdicao = null;

    // ── Carregamento ──────────────────────────────────────────────

    async function carregarProdutos() {
        mostrarEstado("loading");

        try {
            var resultado = await window.supabaseService.client
                .from(window.supabaseService.TABELA)
                .select("*")
                .order("criado_em", { ascending: false });

            if (resultado.error) throw resultado.error;

            todos = resultado.data || [];
            popularCategorias(todos);
            renderizar(todos);

        } catch (erro) {
            mostrarEstado("erro", erro.message);
        }
    }

    // ── Categorias ────────────────────────────────────────────────

    function popularCategorias(produtos) {
        var select = document.getElementById("filtroCategoria");
        var valorAtual = select.value;

        var categorias = produtos
            .map(function (p) { return p.categoria; })
            .filter(function (c) { return c && c.trim() !== ""; })
            .filter(function (c, i, arr) { return arr.indexOf(c) === i; })
            .sort();

        select.innerHTML = '<option value="">Todas as categorias</option>';
        categorias.forEach(function (cat) {
            var opt = document.createElement("option");
            opt.value = cat;
            opt.textContent = cat;
            if (cat === valorAtual) opt.selected = true;
            select.appendChild(opt);
        });
    }

    // ── Filtro ────────────────────────────────────────────────────

    function filtrar() {
        var busca = document.getElementById("busca").value.toLowerCase().trim();
        var categoria = document.getElementById("filtroCategoria").value;

        var resultado = todos.filter(function (p) {
            var bateBusca = !busca || (p.nome && p.nome.toLowerCase().indexOf(busca) !== -1);
            var bateCategoria = !categoria || p.categoria === categoria;
            return bateBusca && bateCategoria;
        });

        renderizar(resultado);
    }

    // ── Renderização ──────────────────────────────────────────────

    function renderizar(produtos) {
        var lista = document.getElementById("listaProdutos");

        if (produtos.length === 0) {
            mostrarEstado("vazio");
            lista.innerHTML = "";
            return;
        }

        mostrarEstado("lista");
        lista.innerHTML = produtos.map(criarCard).join("");

        lista.querySelectorAll(".btn-editar").forEach(function (btn) {
            btn.addEventListener("click", function () {
                abrirEdicao(this.dataset.id);
            });
        });

        lista.querySelectorAll(".btn-excluir").forEach(function (btn) {
            btn.addEventListener("click", function () {
                excluirProduto(this.dataset.id, this.dataset.nome);
            });
        });
    }

    function criarCard(p) {
        var dataCadastro = p.criado_em
            ? new Date(p.criado_em).toLocaleDateString("pt-BR")
            : "—";

        var fotoHtml = p.foto_url
            ? '<img src="' + p.foto_url + '" alt="' + esc(p.nome) + '" class="card-foto" />'
            : '<div class="card-foto-vazia">Sem foto</div>';

        var tagHtml = p.categoria
            ? '<span class="tag">' + esc(p.categoria) + '</span>'
            : '';

        var moeda = window.uiService.moeda;
        var custoTotal = typeof p.custo_total === "number" ? moeda(p.custo_total) : "—";
        var precoVenda = typeof p.preco_venda === "number" ? moeda(p.preco_venda) : "—";
        var lucroLiquido = typeof p.lucro_liquido === "number" ? moeda(p.lucro_liquido) : "—";

        var margem = typeof p.margem_lucro === "number" ? p.margem_lucro : 0;
        var margemPct = Math.min((margem / 200) * 100, 100);
        var margemCor = margem <= 50 ? "#f59e0b" : margem <= 100 ? "#3b82f6" : "#16a34a";

        return (
            '<div class="produto-card">' +
                fotoHtml +
                '<div class="produto-info">' +
                    '<div class="produto-header">' +
                        '<h3>' + esc(p.nome) + '</h3>' +
                        tagHtml +
                    '</div>' +
                    '<div class="produto-dados">' +
                        '<div class="dado"><span>Peso</span><strong>' + (p.peso_gramas || "—") + ' g</strong></div>' +
                        '<div class="dado"><span>Tempo</span><strong>' + (p.tempo_impressao_horas || "—") + ' h</strong></div>' +
                        '<div class="dado-separador"></div>' +
                        '<div class="dado"><span>Custo total</span><strong>' + custoTotal + '</strong></div>' +
                        '<div class="dado"><span>Preço de venda</span><strong class="preco-destaque">' + precoVenda + '</strong></div>' +
                        '<div class="dado"><span>Lucro líquido</span><strong class="lucro-destaque">' + lucroLiquido + '</strong></div>' +
                        '<div class="dado-separador"></div>' +
                        '<div class="dado"><span>Margem de lucro</span><strong>' + margem + '%</strong></div>' +
                        '<div class="margem-barra-bg">' +
                            '<div class="margem-barra-fill" style="width:' + margemPct + '%;background:' + margemCor + '"></div>' +
                        '</div>' +
                        '<div class="margem-escala"><span>0%</span><span>100%</span><span>200%</span></div>' +
                        '<div class="dado-separador"></div>' +
                        '<div class="dado"><span>Cadastrado em</span><strong>' + dataCadastro + '</strong></div>' +
                    '</div>' +
                    '<div class="card-acoes">' +
                        '<button class="btn-acao btn-editar" data-id="' + p.id + '">Editar</button>' +
                        '<button class="btn-acao btn-excluir" data-id="' + p.id + '" data-nome="' + esc(p.nome) + '">Excluir</button>' +
                    '</div>' +
                '</div>' +
            '</div>'
        );
    }

    function esc(texto) {
        if (!texto) return "";
        return String(texto)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    // ── Estado da UI ──────────────────────────────────────────────

    function mostrarEstado(estado, mensagem) {
        document.getElementById("estadoLoading").style.display = estado === "loading" ? "block" : "none";
        document.getElementById("estadoVazio").style.display = estado === "vazio" ? "block" : "none";
        document.getElementById("estadoErro").style.display = estado === "erro" ? "block" : "none";
        document.getElementById("listaProdutos").style.display = estado === "lista" ? "grid" : "none";

        if (estado === "erro") {
            document.getElementById("estadoErro").innerText = "Erro ao carregar: " + (mensagem || "tente novamente.");
        }
    }

    // ── Exclusão ──────────────────────────────────────────────────

    async function excluirProduto(id, nome) {
        if (!confirm('Excluir "' + nome + '"?\nEsta ação não pode ser desfeita.')) return;

        try {
            var resultado = await window.supabaseService.client
                .from(window.supabaseService.TABELA)
                .delete()
                .eq("id", id);

            if (resultado.error) throw resultado.error;

            todos = todos.filter(function (p) { return String(p.id) !== String(id); });
            popularCategorias(todos);
            filtrar();

        } catch (erro) {
            alert("Erro ao excluir: " + erro.message);
        }
    }

    // ── Edição ────────────────────────────────────────────────────

    function gerarSelectMargem(selectId, valorSelecionado) {
        var select = document.getElementById(selectId);
        select.innerHTML = "";
        var arredondado = Math.round(valorSelecionado / 10) * 10;
        arredondado = Math.max(0, Math.min(200, arredondado));

        for (var i = 0; i <= 200; i += 10) {
            var opt = document.createElement("option");
            opt.value = i;
            opt.textContent = i + "%";
            if (i === arredondado) opt.selected = true;
            select.appendChild(opt);
        }
    }

    function abrirEdicao(id) {
        var produto = todos.find(function (p) { return String(p.id) === String(id); });
        if (!produto) return;

        produtoEmEdicao = produto;

        document.getElementById("editNome").value = produto.nome || "";
        document.getElementById("editCategoria").value = produto.categoria || "";
        document.getElementById("editPeso").value = produto.peso_gramas || 0;
        document.getElementById("editTempo").value = produto.tempo_impressao_horas || 0;
        document.getElementById("editFilamento").value = produto.valor_filamento_kg || 0;
        document.getElementById("editPerda").value = produto.percentual_perda || 0;
        document.getElementById("editWatts").value = produto.consumo_watts || 0;
        document.getElementById("editKwh").value = produto.valor_kwh || 0;
        document.getElementById("editAcessorio").value = produto.custo_acessorio || 0;
        document.getElementById("editEmbalagem").value = produto.custo_embalagem || 0;
        document.getElementById("editAcabamento").value = produto.custo_acabamento || 0;
        document.getElementById("editImpressora").value = produto.valor_impressora || 0;
        document.getElementById("editVidaUtil").value = produto.vida_util_horas || 0;
        document.getElementById("editComissao").value = produto.comissao_percentual || 0;

        gerarSelectMargem("editMargem", produto.margem_lucro || 0);

        document.getElementById("modalStatus").innerText = "";
        document.getElementById("modalOverlay").style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    function fecharModal() {
        document.getElementById("modalOverlay").style.display = "none";
        document.body.style.overflow = "";
        produtoEmEdicao = null;
    }

    async function salvarEdicao() {
        if (!produtoEmEdicao) return;

        var btnSalvar = document.getElementById("btnSalvarEdicao");
        var statusEl = document.getElementById("modalStatus");

        btnSalvar.disabled = true;
        btnSalvar.innerText = "Salvando...";
        statusEl.innerText = "";
        statusEl.style.color = "#6b7280";

        try {
            var dados = {
                nome: document.getElementById("editNome").value.trim(),
                categoria: document.getElementById("editCategoria").value.trim(),
                peso: Number(document.getElementById("editPeso").value) || 0,
                tempo: Number(document.getElementById("editTempo").value) || 0,
                valorFilamento: Number(document.getElementById("editFilamento").value) || 0,
                perda: Number(document.getElementById("editPerda").value) || 0,
                watts: Number(document.getElementById("editWatts").value) || 0,
                kwh: Number(document.getElementById("editKwh").value) || 0,
                acessorio: Number(document.getElementById("editAcessorio").value) || 0,
                embalagem: Number(document.getElementById("editEmbalagem").value) || 0,
                acabamento: Number(document.getElementById("editAcabamento").value) || 0,
                valorImpressora: Number(document.getElementById("editImpressora").value) || 0,
                vidaUtil: Number(document.getElementById("editVidaUtil").value) || 0,
                margem: Number(document.getElementById("editMargem").value) || 0,
                comissao: Number(document.getElementById("editComissao").value) || 0
            };

            if (!dados.nome) throw new Error("Informe o nome da peça.");

            var calculado = window.calculadoraService.calcular(dados);

            var atualizacao = {
                nome: dados.nome,
                categoria: dados.categoria,
                peso_gramas: dados.peso,
                tempo_impressao_horas: dados.tempo,
                valor_filamento_kg: dados.valorFilamento,
                percentual_perda: dados.perda,
                consumo_watts: dados.watts,
                valor_kwh: dados.kwh,
                custo_acessorio: dados.acessorio,
                custo_embalagem: dados.embalagem,
                custo_acabamento: dados.acabamento,
                valor_impressora: dados.valorImpressora,
                vida_util_horas: dados.vidaUtil,
                margem_lucro: dados.margem,
                comissao_percentual: dados.comissao,
                custo_total: calculado.custoTotal,
                preco_venda: calculado.precoVenda,
                valor_comissao: calculado.valorComissao,
                lucro_liquido: calculado.lucroLiquido
            };

            var resultado = await window.supabaseService.client
                .from(window.supabaseService.TABELA)
                .update(atualizacao)
                .eq("id", produtoEmEdicao.id);

            if (resultado.error) throw resultado.error;

            todos = todos.map(function (p) {
                if (String(p.id) !== String(produtoEmEdicao.id)) return p;
                return Object.assign({}, p, atualizacao);
            });

            popularCategorias(todos);
            filtrar();
            fecharModal();

        } catch (erro) {
            statusEl.innerText = "Erro: " + erro.message;
            statusEl.style.color = "#dc2626";
        } finally {
            btnSalvar.disabled = false;
            btnSalvar.innerText = "Salvar alterações";
        }
    }

    // ── Event listeners ───────────────────────────────────────────

    document.getElementById("busca").addEventListener("input", filtrar);
    document.getElementById("filtroCategoria").addEventListener("change", filtrar);

    // ── Exports globais ───────────────────────────────────────────

    window.carregarProdutos = carregarProdutos;
    window.fecharModal = fecharModal;
    window.salvarEdicao = salvarEdicao;

    carregarProdutos();
})();
