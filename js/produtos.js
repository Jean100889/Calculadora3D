(function () {
    var todos = [];

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

    function renderizar(produtos) {
        var lista = document.getElementById("listaProdutos");

        if (produtos.length === 0) {
            mostrarEstado("vazio");
            lista.innerHTML = "";
            return;
        }

        mostrarEstado("lista");
        lista.innerHTML = produtos.map(criarCard).join("");
    }

    function criarCard(p) {
        var dataCadastro = p.criado_em
            ? new Date(p.criado_em).toLocaleDateString("pt-BR")
            : "—";

        var fotoHtml = p.foto_url
            ? '<img src="' + p.foto_url + '" alt="' + escapeHtml(p.nome) + '" class="card-foto" />'
            : '<div class="card-foto-vazia">Sem foto</div>';

        var tagHtml = p.categoria
            ? '<span class="tag">' + escapeHtml(p.categoria) + '</span>'
            : '';

        var custoTotal = typeof p.custo_total === "number" ? window.uiService.moeda(p.custo_total) : "—";
        var precoVenda = typeof p.preco_venda === "number" ? window.uiService.moeda(p.preco_venda) : "—";
        var lucroLiquido = typeof p.lucro_liquido === "number" ? window.uiService.moeda(p.lucro_liquido) : "—";

        return (
            '<div class="produto-card">' +
                fotoHtml +
                '<div class="produto-info">' +
                    '<div class="produto-header">' +
                        '<h3>' + escapeHtml(p.nome) + '</h3>' +
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
                        '<div class="dado"><span>Cadastrado em</span><strong>' + dataCadastro + '</strong></div>' +
                    '</div>' +
                '</div>' +
            '</div>'
        );
    }

    function escapeHtml(texto) {
        if (!texto) return "";
        return String(texto)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function mostrarEstado(estado, mensagem) {
        document.getElementById("estadoLoading").style.display = estado === "loading" ? "block" : "none";
        document.getElementById("estadoVazio").style.display = estado === "vazio" ? "block" : "none";
        document.getElementById("estadoErro").style.display = estado === "erro" ? "block" : "none";
        document.getElementById("listaProdutos").style.display = estado === "lista" ? "grid" : "none";

        if (estado === "erro") {
            document.getElementById("estadoErro").innerText = "Erro ao carregar produtos: " + (mensagem || "tente novamente.");
        }
    }

    document.getElementById("busca").addEventListener("input", filtrar);
    document.getElementById("filtroCategoria").addEventListener("change", filtrar);

    window.carregarProdutos = carregarProdutos;

    carregarProdutos();
})();
