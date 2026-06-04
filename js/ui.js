(function () {
    var TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp"];
    var TAMANHO_MAXIMO = 5 * 1024 * 1024;

    function moeda(valor) {
        return valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function pegarNumero(id) {
        return Number(document.getElementById(id).value) || 0;
    }

    function mostrarStatus(mensagem, tipo) {
        var el = document.getElementById("status");
        el.innerText = mensagem;
        el.className = tipo || "";
    }

    function setLoading(ativo) {
        var btn = document.querySelector(".btn.salvar");
        btn.disabled = ativo;
        btn.innerText = ativo ? "Enviando..." : "Salvar no Supabase";
    }

    function validarImagem(arquivo) {
        if (!arquivo) return null;
        if (TIPOS_ACEITOS.indexOf(arquivo.type) === -1) {
            return "Tipo inválido. Use JPEG, PNG ou WebP.";
        }
        if (arquivo.size > TAMANHO_MAXIMO) {
            return "Imagem muito grande. Máximo: 5MB.";
        }
        return null;
    }

    function previewImagem(arquivo) {
        if (!arquivo) return;
        var url = URL.createObjectURL(arquivo);
        document.getElementById("preview").src = url;
    }

    window.uiService = {
        moeda: moeda,
        pegarNumero: pegarNumero,
        mostrarStatus: mostrarStatus,
        setLoading: setLoading,
        validarImagem: validarImagem,
        previewImagem: previewImagem
    };
})();
