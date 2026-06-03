const SUPABASE_URL = "https://ppusjjluvzspdnpkleea.supabase.co";
const SUPABASE_KEY = "sb_publishable_Zrw0uNvKodekeecXz4mxYg_rSOLU1mh";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let resultadoAtual = {};
let imagemSelecionada = null;

function moeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

document.getElementById("foto").addEventListener("change", function (event) {
    imagemSelecionada = event.target.files[0];

    if (imagemSelecionada) {
        const url = URL.createObjectURL(imagemSelecionada);
        document.getElementById("preview").src = url;
    }
});

function pegarNumero(id) {
    return Number(document.getElementById(id).value) || 0;
}

function calcular() {
    const peso = pegarNumero("peso");
    const tempo = pegarNumero("tempo");
    const valorFilamento = pegarNumero("valorFilamento");
    const perda = pegarNumero("perda") / 100;
    const watts = pegarNumero("watts");
    const kwh = pegarNumero("kwh");
    const acessorio = pegarNumero("acessorio");
    const embalagem = pegarNumero("embalagem");
    const acabamento = pegarNumero("acabamento");
    const valorImpressora = pegarNumero("valorImpressora");
    const vidaUtil = pegarNumero("vidaUtil");
    const margem = pegarNumero("margem") / 100;
    const comissaoPercentual = pegarNumero("comissao") / 100;

    const custoFilamento = (peso / 1000) * valorFilamento;
    const custoPerda = custoFilamento * perda;
    const custoEnergia = (watts / 1000) * tempo * kwh;

    const custoMaquinaHora = vidaUtil > 0 ? valorImpressora / vidaUtil : 0;
    const custoMaquina = custoMaquinaHora * tempo;

    const custoTotal =
        custoFilamento +
        custoPerda +
        custoEnergia +
        custoMaquina +
        acessorio +
        embalagem +
        acabamento;

    const precoVenda = custoTotal * (1 + margem);
    const valorComissao = precoVenda * comissaoPercentual;
    const lucroLiquido = precoVenda - custoTotal - valorComissao;

    resultadoAtual = {
        custoFilamento,
        custoPerda,
        custoEnergia,
        custoMaquina,
        custoTotal,
        precoVenda,
        valorComissao,
        lucroLiquido
    };

    document.getElementById("resFilamento").innerText = moeda(custoFilamento);
    document.getElementById("resPerda").innerText = moeda(custoPerda);
    document.getElementById("resEnergia").innerText = moeda(custoEnergia);
    document.getElementById("resMaquina").innerText = moeda(custoMaquina);
    document.getElementById("resTotal").innerText = moeda(custoTotal);
    document.getElementById("resPreco").innerText = moeda(precoVenda);
    document.getElementById("resComissao").innerText = moeda(valorComissao);
    document.getElementById("resLucro").innerText = moeda(lucroLiquido);

    return resultadoAtual;
}

async function salvarProduto() {
    const status = document.getElementById("status");

    try {
        status.innerText = "Enviando produto...";
        status.className = "";

        const nome = document.getElementById("nome").value.trim();

        if (!nome) {
            throw new Error("Informe o nome da peça.");
        }

        calcular();

        let fotoUrl = "";

        if (imagemSelecionada) {
            const extensao = imagemSelecionada.name.split(".").pop();
            const nomeArquivo = `${Date.now()}-${nome.replaceAll(" ", "-")}.${extensao}`;

            const { error: uploadError } = await supabaseClient.storage
                .from("produtos-3d")
                .upload(nomeArquivo, imagemSelecionada);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabaseClient.storage
                .from("produtos-3d")
                .getPublicUrl(nomeArquivo);

            fotoUrl = data.publicUrl;
        }

        const produto = {
            nome: nome,
            categoria: document.getElementById("categoria").value,
            peso_gramas: pegarNumero("peso"),
            tempo_impressao_horas: pegarNumero("tempo"),
            valor_filamento_kg: pegarNumero("valorFilamento"),
            percentual_perda: pegarNumero("perda"),
            consumo_watts: pegarNumero("watts"),
            valor_kwh: pegarNumero("kwh"),
            custo_acessorio: pegarNumero("acessorio"),
            custo_embalagem: pegarNumero("embalagem"),
            custo_acabamento: pegarNumero("acabamento"),
            valor_impressora: pegarNumero("valorImpressora"),
            vida_util_horas: pegarNumero("vidaUtil"),
            margem_lucro: pegarNumero("margem"),
            comissao_percentual: pegarNumero("comissao"),
            custo_total: resultadoAtual.custoTotal,
            preco_venda: resultadoAtual.precoVenda,
            valor_comissao: resultadoAtual.valorComissao,
            lucro_liquido: resultadoAtual.lucroLiquido,
            foto_url: fotoUrl
        };

        const { error } = await supabaseClient
            .from("produtos_3d")
            .insert([produto]);

        if (error) {
            throw error;
        }

        status.innerText = "Produto salvo com sucesso!";
        status.className = "sucesso";

    } catch (erro) {
        console.error(erro);
        status.innerText = "Erro: " + erro.message;
        status.className = "erro";
    }
}