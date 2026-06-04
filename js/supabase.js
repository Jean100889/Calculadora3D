(function () {
    var SUPABASE_URL = "https://ppusjjluvzspdnpkleea.supabase.co";
    var SUPABASE_KEY = "sb_publishable_Zrw0uNvKodekeecXz4mxYg_rSOLU1mh";

    var BUCKET = "produtos-3d";
    var TABELA = "produtos_3d";

    var client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    window.supabaseService = {
        client: client,
        BUCKET: BUCKET,
        TABELA: TABELA
    };
})();
