var imagemSelecionada = null;
var resultadoAtual = {};

document.getElementById("foto").addEventListener("change", function (event) {
    var arquivo = event.target.files[0];
    var erro = window.uiService.validarImagem(arquivo);

    if (erro) {
        window.uiService.mostrarStatus(erro, "erro");
        event.target.value = "";
        imagemSelecionada = null;
        document.getElementById("preview").src = "";
        return;
    }

    imagemSelecionada = arquivo;
    window.uiService.previewImagem(arquivo);
});

function calcular() {
    var dados = {
        peso: window.uiService.pegarNumero("peso"),
        tempo: window.uiService.pegarNumero("tempo"),
        valorFilamento: window.uiService.pegarNumero("valorFilamento"),
        perda: window.uiService.pegarNumero("perda"),
        watts: window.uiService.pegarNumero("watts"),
        kwh: window.uiService.pegarNumero("kwh"),
        acessorio: window.uiService.pegarNumero("acessorio"),
        embalagem: window.uiService.pegarNumero("embalagem"),
        acabamento: window.uiService.pegarNumero("acabamento"),
        valorImpressora: window.uiService.pegarNumero("valorImpressora"),
        vidaUtil: window.uiService.pegarNumero("vidaUtil"),
        margem: window.uiService.pegarNumero("margem"),
        comissao: window.uiService.pegarNumero("comissao")
    };

    resultadoAtual = window.calculadoraService.calcular(dados);

    var moeda = window.uiService.moeda;
    document.getElementById("resFilamento").innerText = moeda(resultadoAtual.custoFilamento);
    document.getElementById("resPerda").innerText = moeda(resultadoAtual.custoPerda);
    document.getElementById("resEnergia").innerText = moeda(resultadoAtual.custoEnergia);
    document.getElementById("resMaquina").innerText = moeda(resultadoAtual.custoMaquina);
    document.getElementById("resTotal").innerText = moeda(resultadoAtual.custoTotal);
    document.getElementById("resPreco").innerText = moeda(resultadoAtual.precoVenda);
    document.getElementById("resComissao").innerText = moeda(resultadoAtual.valorComissao);
    document.getElementById("resLucro").innerText = moeda(resultadoAtual.lucroLiquido);

    return resultadoAtual;
}

async function salvarProduto() {
    try {
        window.uiService.setLoading(true);
        window.uiService.mostrarStatus("Enviando produto...", "");

        var nome = document.getElementById("nome").value.trim();
        if (!nome) throw new Error("Informe o nome da peça.");

        calcular();

        var fotoUrl = "";

        if (imagemSelecionada) {
            var extensao = imagemSelecionada.name.split(".").pop();
            var nomeArquivo = Date.now() + "-" + nome.replaceAll(" ", "-") + "." + extensao;

            var upload = await window.supabaseService.client.storage
                .from(window.supabaseService.BUCKET)
                .upload(nomeArquivo, imagemSelecionada);

            if (upload.error) throw upload.error;

            var urlData = window.supabaseService.client.storage
                .from(window.supabaseService.BUCKET)
                .getPublicUrl(nomeArquivo);

            fotoUrl = urlData.data.publicUrl;
        }

        var produto = {
            nome: nome,
            categoria: document.getElementById("categoria").value,
            peso_gramas: window.uiService.pegarNumero("peso"),
            tempo_impressao_horas: window.uiService.pegarNumero("tempo"),
            valor_filamento_kg: window.uiService.pegarNumero("valorFilamento"),
            percentual_perda: window.uiService.pegarNumero("perda"),
            consumo_watts: window.uiService.pegarNumero("watts"),
            valor_kwh: window.uiService.pegarNumero("kwh"),
            custo_acessorio: window.uiService.pegarNumero("acessorio"),
            custo_embalagem: window.uiService.pegarNumero("embalagem"),
            custo_acabamento: window.uiService.pegarNumero("acabamento"),
            valor_impressora: window.uiService.pegarNumero("valorImpressora"),
            vida_util_horas: window.uiService.pegarNumero("vidaUtil"),
            margem_lucro: window.uiService.pegarNumero("margem"),
            comissao_percentual: window.uiService.pegarNumero("comissao"),
            custo_total: resultadoAtual.custoTotal,
            preco_venda: resultadoAtual.precoVenda,
            valor_comissao: resultadoAtual.valorComissao,
            lucro_liquido: resultadoAtual.lucroLiquido,
            foto_url: fotoUrl
        };

        var insert = await window.supabaseService.client
            .from(window.supabaseService.TABELA)
            .insert([produto]);

        if (insert.error) throw insert.error;

        window.uiService.mostrarStatus("Produto salvo com sucesso!", "sucesso");

    } catch (erro) {
        console.error(erro);
        window.uiService.mostrarStatus("Erro: " + erro.message, "erro");
    } finally {
        window.uiService.setLoading(false);
    }
}
