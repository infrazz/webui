/* Infrazz — shared site script.
   ----------------------------------------------------------------
   CONTACT SETTINGS: fill these in and every WhatsApp / booking button
   on the site switches over. Left empty, those buttons fall back to email.
     whatsapp: Singapore number, digits only with country code, e.g. '6591234567'
     booking:  your HubSpot (or other) meetings link, e.g. 'https://meetings.hubspot.com/...'
   ---------------------------------------------------------------- */
window.INFRAZZ = {
  whatsapp: '',
  booking: '',
  email: 'hello@infrazz.com'
};

(function () {
  var C = window.INFRAZZ;

  function waLink(text) {
    return 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(text);
  }
  function mailLink(subject, body) {
    return 'mailto:' + C.email + '?subject=' + encodeURIComponent(subject) + (body ? '&body=' + encodeURIComponent(body) : '');
  }
  window.INFRAZZ.contactLink = function (text, subject) {
    return C.whatsapp ? waLink(text) : mailLink(subject || 'Infrazz enquiry', text);
  };

  // WhatsApp buttons: <a data-wa="prefilled message">. Without a number they become email links.
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    var text = a.getAttribute('data-wa');
    if (C.whatsapp) {
      a.href = waLink(text);
      a.target = '_blank';
      a.rel = 'noopener';
    } else {
      a.href = mailLink('Infrazz enquiry', text);
      var label = a.querySelector('[data-label]');
      if (label) label.textContent = 'Email us';
      var icon = a.querySelector('svg');
      if (icon) icon.remove();
    }
  });

  // Booking buttons: hidden in the HTML until a booking link is set.
  document.querySelectorAll('[data-booking]').forEach(function (a) {
    if (C.booking) {
      a.href = C.booking;
      a.target = '_blank';
      a.rel = 'noopener';
      a.hidden = false;
    } else {
      a.remove();
    }
  });

  // Hero: business name -> new address preview
  var nameInput = document.getElementById('biz-name');
  if (nameInput) {
    var oldEl = document.getElementById('old-addr');
    var newEl = document.getElementById('new-addr');
    var siteEl = document.getElementById('new-site');
    var newBox = newEl.parentElement;

    function slug(name) {
      var s = name.toLowerCase()
        .replace(/'s\b/g, 's')
        .replace(/\b(pte\.?|ltd\.?|llp|private|limited|sdn\.?|bhd\.?)\b/g, '')
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '');
      return s.slice(0, 28) || 'yourbusiness';
    }

    var timer;
    function render(animate) {
      var s = slug(nameInput.value);
      oldEl.textContent = s + '88@gmail.com';
      newEl.textContent = 'hello@' + s + '.sg';
      siteEl.textContent = 'www.' + s + '.sg';
      if (animate) {
        newBox.classList.remove('sweep');
        void newBox.offsetWidth;
        newBox.classList.add('sweep');
      }
    }
    nameInput.addEventListener('input', function () {
      render(false);
      clearTimeout(timer);
      timer = setTimeout(function () { render(true); }, 450);
    });
    render(true);
  }

  // Pricing tabs. Without JS the tab bar stays hidden and every panel shows in turn.
  var tablist = document.querySelector('.tabs[role="tablist"]');
  if (tablist) {
    var tabs = [].slice.call(tablist.querySelectorAll('[role="tab"]'));
    var select = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t, false); });
      t.addEventListener('keydown', function (e) {
        var j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
        if (j === null) return;
        e.preventDefault();
        select(tabs[(j + tabs.length) % tabs.length], true);
      });
    });
    tablist.hidden = false;
    document.documentElement.classList.add('js-tabs');
    select(tabs[0], false);
  }

  // Health Check shortcut forms: send the domain to /check/
  document.querySelectorAll('form[data-check-shortcut]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = f.querySelector('input').value.trim();
      window.location.href = '/check/' + (d ? '?d=' + encodeURIComponent(d) : '');
    });
  });
})();
