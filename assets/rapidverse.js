/* ZKNbet - client de jogos da Rapidverse (substitui assets/nitrogames.js)
 * - Lista:  GET  /api/rapidverse/games   (publico)
 * - Abrir:  POST /api/rapidverse/launch  (precisa de login)
 * Mantem a mesma interface do antigo NitroGames (listarJogos, listarProvedores,
 * abrirJogo) para as paginas atuais continuarem funcionando.
 */
(function () {
  'use strict';

  var API = (window.ZKN_CONFIG && window.ZKN_CONFIG.api) ||
    'https://zknbet-api.gabrielrobin63.workers.dev/api';

  var _lista = null;      // jogos normalizados
  var _porCode = {};      // game_code -> jogo
  var _pendente = null;   // promise em andamento (evita 2 fetch ao mesmo tempo)

  function getToken() {
    try {
      if (window.ZKNAuth && typeof window.ZKNAuth.getToken === 'function') {
        var t = window.ZKNAuth.getToken();
        if (t) return t;
      }
    } catch (e) {}
    try {
      return localStorage.getItem('zkn_token') || localStorage.getItem('token') || '';
    } catch (e) {
      return '';
    }
  }

  // "PGSoft" -> "PG Soft", "PragmaticPlay" -> "Pragmatic Play"
  function nomeProvider(v) {
    return String(v || '')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .trim() || 'Outra';
  }

  function normalizar(j) {
    var vendor = j.vendor_code || '';
    return {
      game_code: j.game_code,
      name: j.name || '',
      vendor_code: vendor,
      vendor_game_code: j.vendor_game_code,
      provider_name: nomeProvider(vendor),
      // capa: usa image_url se existir, senao img/{vendor_game_code}.png
      image_url: j.image_url || (j.vendor_game_code ? 'img/' + vendor + '/' + j.vendor_game_code + '.png' : ''),
      game_type: j.game_type || '',
      rtp: j.rtp
    };
  }

  // Jogos mais famosos: aparecem primeiro, nessa ordem (o resto fica em ordem alfabetica).
  // Para mudar a ordem ou incluir jogos, edite so esta lista (nome igual ao do catalogo).
  var FAMOSOS = [
    'Fortune Tiger', 'Gates of Olympus', 'Fortune Ox', 'Sweet Bonanza', 'Fortune Rabbit',
    'Sugar Rush', 'Fortune Mouse', 'Fortune Dragon', 'Big Bass Bonanza', 'Big Bass Splash',
    'Fortune Snake', 'Fortune Horse', 'Starlight Princess', 'Ganesha Gold', 'Bikini Paradise',
    'The Dog House', 'Double Fortune', 'Dragon Tiger Luck', 'Midas Fortune', 'Mahjong Ways',
    'Mahjong Ways 2', 'Lucky Neko', 'Treasures of Aztec', 'Wild Bandito', 'Cash Mania',
    'Chicky Run', 'Caishen Wins', 'Candy Burst', 'Jungle Delight', 'Wolf Gold'
  ];
  var _prio = {};
  FAMOSOS.forEach(function (n, i) { _prio[n.toLowerCase()] = i; });

  function ordenar(lista) {
    return lista.slice().sort(function (a, b) {
      var pa = _prio[String(a.name).toLowerCase()];
      var pb = _prio[String(b.name).toLowerCase()];
      if (pa !== undefined && pb !== undefined) return pa - pb;
      if (pa !== undefined) return -1;
      if (pb !== undefined) return 1;
      return 0; // sort estavel: mantem a ordem alfabetica que veio do servidor
    });
  }
  function msgErro(d, padrao) {
    return (d && (d.mensagem || d.message || d.error)) || padrao;
  }

  function listarJogos(forcar) {
    if (_lista && !forcar) return Promise.resolve({ sucesso: true, jogos: _lista });
    if (_pendente) return _pendente;

    _pendente = fetch(API + '/rapidverse/games')
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) {
          if (!r.ok || !d.sucesso) {
            return { sucesso: false, mensagem: msgErro(d, 'Erro ao carregar jogos.') };
          }
          _lista = ordenar((d.jogos || []).map(normalizar));
          _porCode = {};
          _lista.forEach(function (j) { _porCode[j.game_code] = j; });
          return { sucesso: true, jogos: _lista };
        });
      })
      .catch(function () {
        return { sucesso: false, mensagem: 'Falha de conexao. Tente novamente.' };
      })
      .then(function (res) {
        _pendente = null;
        return res;
      });

    return _pendente;
  }

  // Provedoras derivadas da lista de jogos (a Rapidverse nao tem endpoint proprio)
  function listarProvedores() {
    return listarJogos().then(function (res) {
      if (!res.sucesso) return { sucesso: false, mensagem: res.mensagem, provedores: [] };
      var cont = {};
      res.jogos.forEach(function (j) {
        var k = j.provider_name;
        cont[k] = (cont[k] || 0) + 1;
      });
      var provedores = Object.keys(cont)
        .map(function (n) { return { name: n, count: cont[n] }; })
        .sort(function (a, b) { return b.count - a.count || a.name.localeCompare(b.name); });
      return { sucesso: true, provedores: provedores };
    });
  }

  // O segundo parametro (email) existe so por compatibilidade com o NitroGames.
  function abrirJogo(gameCode) {
    var token = getToken();
    if (!token) return Promise.resolve({ sucesso: false, mensagem: 'Faca login para jogar.' });

    var pronto = _porCode[gameCode] ? Promise.resolve() : listarJogos();
    return pronto.then(function () {
      var j = _porCode[gameCode];
      if (!j) return { sucesso: false, mensagem: 'Jogo nao encontrado.' };

      return fetch(API + '/rapidverse/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ game_code: j.game_code, vendor_code: j.vendor_code })
      })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (d) {
            if (!r.ok || !d.launch_url) {
              return { sucesso: false, mensagem: msgErro(d, 'Erro ao abrir jogo.') };
            }
            return { sucesso: true, launch_url: d.launch_url };
          });
        })
        .catch(function () {
          return { sucesso: false, mensagem: 'Falha de conexao. Tente novamente.' };
        });
    });
  }

  var api = {
    listarJogos: listarJogos,
    listarProvedores: listarProvedores,
    abrirJogo: abrirJogo
  };
  window.Rapidverse = api;
  window.NitroGames = api; // alias: paginas antigas continuam funcionando

  // Substitui o antigo providers-map.js (mapeamento de provedoras da NitroGames).
  // Aqui o provider ja vem certo (vendor_code), entao so devolve a lista.
  window.ZKNProviders = {
    aplicarProvidersReais: function (lista) { return lista || []; },
    providersUnicos: function (lista) {
      var vistos = {};
      (lista || []).forEach(function (j) { if (j.provider_name) vistos[j.provider_name] = 1; });
      return Object.keys(vistos).sort();
    }
  };
})();