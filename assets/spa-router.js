// ============================================================
// ZKNbet — SPA Router (navegacao instantanea entre paginas)
// Intercepta cliques em links internos e troca SO o conteudo
// ============================================================

(function() {
  const EXCLUIR = [
    'login.html',
    'cadastro.html',
    'saque-primeiro-acesso.html',
    'index.html'
  ];

  let _cache = new Map();
  let _navegando = false;

  function getMain() {
    // Prioridade: .spa-main -> <main> -> <section> principal
    var el = document.querySelector('.spa-main') ||
             document.querySelector('main') ||
             document.querySelector('section.section');
    if (el) return el;
    // Fallback: cria um wrapper dinamicamente se nao achar nada
    var header = document.querySelector('.zkn-header');
    if (header && header.nextElementSibling) {
      return header.nextElementSibling.parentNode;
    }
    return document.body;
  }

  function deveInterceptar(a) {
    if (!a || !a.href) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hostname !== location.hostname) return false;
    if (a.href === location.href) return false;
    if (a.href.startsWith('javascript:')) return false;

    const path = new URL(a.href).pathname.split('/').pop() || 'index.html';
    if (EXCLUIR.includes(path)) return false;
    return true;
  }

  async function carregarPagina(url) {
    if (_cache.has(url)) return _cache.get(url);
    const resp = await fetch(url, { credentials: 'same-origin' });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const html = await resp.text();
    _cache.set(url, html);
    return html;
  }

  function extrairConteudo(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const main = doc.querySelector('.spa-main') || doc.querySelector('main') || doc.body;
    return { content: main.innerHTML, title: doc.title };
  }

  async function navegar(url, push = true) {
    if (_navegando) return;
    _navegando = true;

    try {
      document.body.classList.add('spa-loading');

      const html = await carregarPagina(url);
      const { content, title } = extrairConteudo(html);

      const main = getMain();
      main.innerHTML = content;
      document.title = title || 'ZKNbet';

      if (push) history.pushState({ url }, '', url);

      executarScriptsInline();
      atualizarMenuAtivo();
      window.scrollTo({ top: 0, behavior: 'instant' });

    } catch (e) {
      console.warn('[SPA] falhou, recarrega normal:', e.message);
      location.href = url;
    } finally {
      _navegando = false;
      document.body.classList.remove('spa-loading');
    }
  }

  function executarScriptsInline() {
    const main = getMain();
    main.querySelectorAll('script').forEach(oldScript => {
      const newScript = document.createElement('script');
      if (oldScript.src) {
        newScript.src = oldScript.src;
      } else {
        newScript.textContent = oldScript.textContent;
      }
      newScript.async = false;
      oldScript.replaceWith(newScript);
    });
  }

  function atualizarMenuAtivo() {
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.zkn-nav a').forEach(a => {
      const href = a.getAttribute('href') || '';
      a.classList.toggle('active', href === path);
    });
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!deveInterceptar(a)) return;
    e.preventDefault();
    navegar(a.href);
  });

  window.addEventListener('popstate', () => {
    navegar(location.href, false);
  });

  document.addEventListener('mouseover', (e) => {
    const a = e.target.closest('a');
    if (!deveInterceptar(a)) return;
    carregarPagina(a.href).catch(() => {});
  });

  window.ZKNSpa = { navegar };
})();