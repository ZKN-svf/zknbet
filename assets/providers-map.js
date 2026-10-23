// ============================================================
// ZKNbet - Mapa de provedoras reais
// A NitroGames retorna provider_name="PGSOFT" para todos.
// Este mapa corrige a exibicao no frontend.
// Para adicionar: edite PROVIDER_OVERRIDES abaixo.
// ============================================================

const PROVIDER_OVERRIDES = {
  // ===== PRAGMATIC PLAY =====
  "gates of olympus": "Pragmatic Play",
  "gates of olympus 1000": "Pragmatic Play",
  "sweet bonanza": "Pragmatic Play",
  "sweet bonanza xmas": "Pragmatic Play",
  "sweet bonanza 1000": "Pragmatic Play",
  "sugar rush": "Pragmatic Play",
  "sugar rush 1000": "Pragmatic Play",
  "sugar rush xmas": "Pragmatic Play",
  "starlight princess": "Pragmatic Play",
  "starlight princess 1000": "Pragmatic Play",
  "starlight christmas": "Pragmatic Play",
  "the dog house": "Pragmatic Play",
  "the dog house megaways": "Pragmatic Play",
  "the dog house multihold": "Pragmatic Play",
  "wolf gold": "Pragmatic Play",
  "wild west gold": "Pragmatic Play",
  "wild beach party": "Pragmatic Play",
  "chilli heat": "Pragmatic Play",
  "chilli heat megaways": "Pragmatic Play",
  "pirate gold": "Pragmatic Play",
  "day of dead": "Pragmatic Play",
  "candy ville": "Pragmatic Play",
  "pyramid bonanza": "Pragmatic Play",
  "pyramid king": "Pragmatic Play",
  "wild booster": "Pragmatic Play",
  "wild gladiator": "Pragmatic Play",
  "wild pixies": "Pragmatic Play",
  "rise of samurai": "Pragmatic Play",
  "rise of samurai 3": "Pragmatic Play",
  "safari king": "Pragmatic Play",
  "spartan king": "Pragmatic Play",
  "striking hot 5": "Pragmatic Play",
  "super 7s": "Pragmatic Play",
  "the tiger warrior": "Pragmatic Play",
  "the tweety house": "Pragmatic Play",
  "vampires vs wolves": "Pragmatic Play",
  "return of the dead": "Pragmatic Play",
  "cowboys gold": "Pragmatic Play",
  "bonanza gold": "Pragmatic Play",
  "tales of egypt": "Pragmatic Play",
  "jungle delight": "Pragmatic Play",
  "dragon tiger luck": "Pragmatic Play",
  "double fortune": "Pragmatic Play",
  "fortune dragon": "Pragmatic Play",
  "fortune mouse": "Pragmatic Play",
  "fortune ox": "Pragmatic Play",
  "fortune rabbit": "Pragmatic Play",
  "fortune tiger": "Pragmatic Play",
  "ganesha gold": "Pragmatic Play",

  // ===== PG SOFT =====
  "bikini paradise": "PG Soft",
  "hood vs woolf": "PG Soft",
  "jack frost": "PG Soft",
  "phoenix rises": "PG Soft",
  "queen of bounty": "PG Soft",
  "songkran party": "PG Soft",
  "treasures of aztec": "PG Soft",
  "medusa": "PG Soft",
  "fortune gods": "PG Soft",
  "mahjong ways": "PG Soft",
  "mahjong ways 2": "PG Soft",
  "dreams of macau": "PG Soft",
  "wild bandito": "PG Soft",

  // ===== REEL KINGDOM =====
  "big bass bonanza": "Reel Kingdom",
  "big bass splash": "Reel Kingdom",
  "big bass bonanza - keeping it reel": "Reel Kingdom",
  "bigger bass bonanza": "Reel Kingdom",
  "bigger bass blizzard - christmas catch": "Reel Kingdom",
  "christmas big bass bonanza": "Reel Kingdom",
  "big bass secrets of the golden lake": "Reel Kingdom",
};

function providerReal(jogo) {
  const nome = String(jogo.name || '').toLowerCase().trim();
  const override = PROVIDER_OVERRIDES[nome];
  if (override) return override;
  return jogo.provider_name || '';
}

function aplicarProvidersReais(jogos) {
  return jogos.map(j => ({ ...j, provider_name: providerReal(j) }));
}

function providersUnicos(jogos) {
  const set = new Set();
  jogos.forEach(j => {
    const p = providerReal(j);
    if (p) set.add(p);
  });
  return Array.from(set).sort();
}

window.ZKNProviders = { providerReal, aplicarProvidersReais, providersUnicos, PROVIDER_OVERRIDES };
