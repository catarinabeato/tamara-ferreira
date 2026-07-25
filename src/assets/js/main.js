/*
 * Tamara Ferreira — comportamento mínimo.
 * Sem bibliotecas, sem carrosséis, sem parallax. Apenas o necessário:
 * menu em ecrãs pequenos, filtro do blog, formulários e um fade-in discreto.
 * Tudo funciona sem JavaScript; isto é apenas melhoria progressiva.
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------- menu em ecrã pequeno */

  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.getElementById('menu-mobile');

  if (toggle && menu) {
    var labelEl = toggle.querySelector('[data-nav-label-open]');
    var srEl = toggle.querySelector('[data-nav-sr]');
    var srOpen = srEl ? srEl.textContent : '';

    var setMenu = function (open) {
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (labelEl) {
        labelEl.textContent = open
          ? labelEl.getAttribute('data-nav-label-close')
          : labelEl.getAttribute('data-nav-label-open');
      }
      if (srEl) srEl.textContent = open ? '' : srOpen;
    };

    toggle.addEventListener('click', function () {
      setMenu(menu.hidden);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !menu.hidden) {
        setMenu(false);
        toggle.focus();
      }
    });

    /* Fechar ao navegar para uma âncora da mesma página. */
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });
  }

  /* --------------------------------------------- linha do cabeçalho fixo */

  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------------------------------------------ filtro do blog */

  var filterBar = document.querySelector('[data-filters]');
  var postList = document.querySelector('[data-post-list]');
  var emptyState = document.querySelector('[data-empty]');

  if (filterBar && postList) {
    filterBar.addEventListener('click', function (event) {
      var button = event.target.closest('[data-filter]');
      if (!button) return;

      var selected = button.getAttribute('data-filter');
      var visible = 0;

      filterBar.querySelectorAll('[data-filter]').forEach(function (item) {
        var active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });

      postList.querySelectorAll('[data-category]').forEach(function (card) {
        var show = selected === 'all' || card.getAttribute('data-category') === selected;
        card.hidden = !show;
        if (show) visible++;
      });

      if (emptyState) emptyState.hidden = visible !== 0;
    });
  }

  /* ---------------------------------------------------------- formulários */

  document.querySelectorAll('[data-form]').forEach(function (form) {
    var status = form.querySelector('[data-form-status]');
    var submit = form.querySelector('button[type="submit"]');
    var endpoint = form.getAttribute('data-endpoint');
    var fallbackEmail = form.getAttribute('data-fallback-email');

    var say = function (message, isError) {
      if (!status) return;
      status.textContent = message;
      status.classList.toggle('is-error', Boolean(isError));
    };

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      /* Validação nativa, com a mensagem do browser no idioma do visitante. */
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var data = new FormData(form);

      /* Sem endpoint configurado: abre o cliente de email do visitante.
         Configurar site.json → forms para envio directo. */
      if (!endpoint) {
        var subject = data.get('subject') || form.getAttribute('data-form');
        var lines = [];
        data.forEach(function (value, key) {
          if (key !== 'consent') lines.push(key + ': ' + value);
        });
        window.location.href =
          'mailto:' +
          fallbackEmail +
          '?subject=' +
          encodeURIComponent(String(subject)) +
          '&body=' +
          encodeURIComponent(lines.join('\n\n'));
        say(status ? status.getAttribute('data-success') : '', false);
        return;
      }

      if (submit) submit.disabled = true;
      say(status.getAttribute('data-sending'), false);

      fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (response) {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          form.reset();
          say(status.getAttribute('data-success'), false);
        })
        .catch(function () {
          say(status.getAttribute('data-error'), true);
        })
        .finally(function () {
          if (submit) submit.disabled = false;
        });
    });
  });

  /* --------------------------------------- aparecimento subtil ao entrar */

  if (!reduceMotion && 'IntersectionObserver' in window) {
    var targets = document.querySelectorAll(
      '.section__head, .tenet, .card, .project, .quote, .story__block, .hero__text, .grid__media, .page-head__inner'
    );

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );

    targets.forEach(function (element) {
      element.setAttribute('data-reveal', '');
      observer.observe(element);
    });
  }
})();
