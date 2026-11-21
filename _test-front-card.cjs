const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync('C:/Users/ZKN/Desktop/ZKNbet/slot-zkn-777.html', 'utf8');

function extractFunction(name) {
  const start = html.indexOf('function ' + name + '(');
  if (start < 0) throw new Error('not found ' + name);
  let i = html.indexOf('{', start);
  let depth = 0;
  for (let j = i; j < html.length; j++) {
    const ch = html[j];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return html.slice(start, j + 1);
    }
  }
  throw new Error('unclosed ' + name);
}

const code = [
  'const CARD_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];',
  'const CARD_DROP_CONTINUE = 0.735;',
  'const CARD_VALUES_DEFAULT = { clover: 2.6, coin: 2.7, ruby: 2.8, bell: 2.9, seven: 3.0, crown: 3.1, wild: 3.2 };',
  'const cardFullMultiplier = 10;',
  "const SYM_ORDER = ['clover','coin','ruby','bell','seven','crown','wild'];",
  'const SYM_MAP = { clover:{weight:66}, coin:{weight:45}, ruby:{weight:33}, bell:{weight:21}, seven:{weight:12}, crown:{weight:6}, wild:{weight:9} };',
  'const cardBonusValues = { ...CARD_VALUES_DEFAULT };',
  extractFunction('cartaSortearSimbolo'),
  extractFunction('cartaLinhasNovas'),
  extractFunction('cartaGerarQuedas'),
  extractFunction('montarCartaLocal'),
  extractFunction('simularCompraBonusLocal'),
  'globalThis.sim = simularCompraBonusLocal;',
].join('\n');

const context = { Math, Array, Object, Set, console };
vm.createContext(context);
vm.runInContext(code, context);
const sim = context.sim;

const N = 100000;
const dist = {};
let sum = 0, full = 0;
for (let n = 0; n < N; n++) {
  const r = sim(1);
  const d = r.cardDrop;
  dist[d.count] = (dist[d.count] || 0) + 1;
  if (d.full) full++;
  sum += r.win;

  const filled = new Set();
  for (const q of d.waves) {
    if (q.positions.length !== 1) throw new Error('queda != 1 posicao');
    for (const p of q.positions) {
      if (p < 0 || p > 8) throw new Error('pos');
      if (filled.has(p)) throw new Error('pos repetida');
      filled.add(p);
      if (r.grid[p] !== d.symbol) throw new Error('simbolo errado na grade');
    }
  }
  if (filled.size !== d.count) throw new Error('count');
  if (d.waves.length !== d.count) throw new Error('waves != count');
  for (let i = 0; i < 9; i++) {
    if (filled.has(i)) {
      if (r.grid[i] !== d.symbol) throw new Error('forasteiro');
    } else if (r.grid[i] !== null) throw new Error('casa vazia suja');
  }
  if (d.full !== (d.count === 9)) throw new Error('full inconsistente');
  if (d.full && !d.waves[d.waves.length - 1].full) throw new Error('ultima queda nao marcou full');
  const expected = Math.round(1 * d.count * d.perSymbol * (d.full ? 10 : 1) * 100) / 100;
  if (Math.abs(expected - r.win) > 0.001) throw new Error('win ' + expected + ' vs ' + r.win);
  if (r.win > 500000) throw new Error('cap');
}
const distPct = {};
for (let k = 1; k <= 9; k++) distPct[k] = +((dist[k] || 0) / N * 100).toFixed(2);
console.log(JSON.stringify({
  n: N,
  dist: distPct,
  fullPct: +(full / N * 100).toFixed(2),
  rtp: +(sum / N / 30 * 100).toFixed(2),
}, null, 2));
