(function () {
    function calcular(dados) {
        var perdaDecimal = dados.perda / 100;
        var margemDecimal = dados.margem / 100;
        var comissaoDecimal = dados.comissao / 100;

        var custoFilamento = (dados.peso / 1000) * dados.valorFilamento;
        var custoPerda = custoFilamento * perdaDecimal;
        var custoEnergia = (dados.watts / 1000) * dados.tempo * dados.kwh;

        var custoMaquinaHora = dados.vidaUtil > 0 ? dados.valorImpressora / dados.vidaUtil : 0;
        var custoMaquina = custoMaquinaHora * dados.tempo;

        var custoTotal =
            custoFilamento +
            custoPerda +
            custoEnergia +
            custoMaquina +
            dados.acessorio +
            dados.embalagem +
            dados.acabamento;

        var precoVenda = custoTotal * (1 + margemDecimal);
        var valorComissao = precoVenda * comissaoDecimal;
        var lucroLiquido = precoVenda - custoTotal - valorComissao;

        return {
            custoFilamento: custoFilamento,
            custoPerda: custoPerda,
            custoEnergia: custoEnergia,
            custoMaquina: custoMaquina,
            custoTotal: custoTotal,
            precoVenda: precoVenda,
            valorComissao: valorComissao,
            lucroLiquido: lucroLiquido
        };
    }

    window.calculadoraService = {
        calcular: calcular
    };
})();
