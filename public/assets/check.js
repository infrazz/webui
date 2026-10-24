/* Infrazz Email Health Check
   Looks up public DNS records from the browser (DNS-over-HTTPS, Google first, Cloudflare as fallback)
   and grades MX, SPF, DKIM and DMARC. Nothing is sent to Infrazz. */
(function () {
  'use strict';

  var RESOLVERS = [
    function (name, type) { return fetch('https://dns.google/resolve?name=' + encodeURIComponent(name) + '&type=' + type); },
    function (name, type) { return fetch('https://cloudflare-dns.com/dns-query?name=' + encodeURIComponent(name) + '&type=' + type, { headers: { accept: 'application/dns-json' } }); }
  ];
  var TYPE = { CNAME: 5, MX: 15, TXT: 16 };

  // ---------- DNS ----------
  function lookup(name, type) {
    var i = 0;
    function attempt() {
      if (i >= RESOLVERS.length) return Promise.reject(new Error('dns-unreachable'));
      var r = RESOLVERS[i++];
      return r(name, type)
        .then(function (res) { if (!res.ok) throw new Error('http ' + res.status); return res.json(); })
        .catch(function () { return attempt(); });
    }
    return attempt().then(function (j) {
      var answers = (j.Answer || []).filter(function (a) { return a.type === TYPE[type] || a.type === TYPE.CNAME; });
      return { status: j.Status, answers: answers };
    });
  }

  function txtValue(data) {
    // Cloudflare returns "quoted" "chunks"; Google usually returns plain text.
    var s = String(data).trim();
    if (s.charAt(0) === '"') s = s.replace(/^"|"$/g, '').replace(/"\s+"/g, '');
    return s;
  }

  function txtRecords(r) {
    return r.answers.filter(function (a) { return a.type === TYPE.TXT; }).map(function (a) { return txtValue(a.data); });
  }

  // ---------- input ----------
  function normalise(input) {
    var d = String(input || '').trim().toLowerCase();
    if (d.indexOf('@') > -1) d = d.split('@').pop();
    d = d.replace(/^[a-z]+:\/\//, '').split(/[\/?#:]/)[0].replace(/\.$/, '').replace(/^www\./, '');
    return /^(?=.{3,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(d) ? d : null;
  }

  // ---------- providers ----------
  function providerFromMx(hosts) {
    var h = hosts.join(' ');
    if (/google\.com|googlemail\.com/.test(h)) return { key: 'google', name: 'Google Workspace' };
    if (/protection\.outlook\.com|outlook\.com/.test(h)) return { key: 'microsoft', name: 'Microsoft 365' };
    if (/mx\.cloudflare\.net/.test(h)) return { key: 'cfrouting', name: 'Cloudflare Email Routing (forwarding only)' };
    if (/zoho\./.test(h)) return { key: 'zoho', name: 'Zoho Mail' };
    if (/secureserver\.net/.test(h)) return { key: 'other', name: 'GoDaddy email' };
    return { key: 'other', name: hosts[0] };
  }

  var DKIM_SELECTORS = {
    google: ['google'],
    microsoft: ['selector1', 'selector2'],
    zoho: ['zmail', 'zoho', 'default'],
    other: ['default', 'google', 'selector1', 'selector2', 'k1', 's1', 's2', 'mail', 'dkim', 'zmail']
  };

  // ---------- checks ----------
  function checkMx(domain) {
    return lookup(domain, 'MX').then(function (r) {
      if (r.status === 3) return { nxdomain: true };
      var mx = r.answers.filter(function (a) { return a.type === TYPE.MX; }).map(function (a) {
        var parts = String(a.data).split(/\s+/);
        return { pref: Number(parts[0]), host: (parts[1] || '').replace(/\.$/, '') };
      }).sort(function (a, b) { return a.pref - b.pref; });
      if (!mx.length) {
        return { status: 'fail', found: 'No mail server is set for this domain.', fix: 'Email sent to this domain will bounce. Add MX records for your email provider.' };
      }
      if (mx.length === 1 && (mx[0].host === '' || mx[0].host === '.')) {
        return { status: 'info', found: 'This domain says it does not accept email (null MX).' };
      }
      var hosts = mx.map(function (m) { return m.host; });
      var p = providerFromMx(hosts);
      return { status: 'pass', provider: p, found: 'Mail goes to ' + p.name + '.', records: hosts };
    });
  }

  function checkSpf(domain, provider) {
    return lookup(domain, 'TXT').then(function (r) {
      var spf = txtRecords(r).filter(function (t) { return /^v=spf1(\s|$)/i.test(t); });
      if (!spf.length) return { status: 'fail', found: 'No SPF record found.', fix: 'Add an SPF record listing the services allowed to send as you. Without it, receivers can\'t tell real mail from fakes.' };
      if (spf.length > 1) return { status: 'fail', found: 'There are ' + spf.length + ' SPF records.', records: spf, fix: 'Only one SPF record is allowed. Receivers treat two as an error, so merge them into one.' };
      var rec = spf[0];
      var m = rec.match(/(?:^|\s)([+?~-]?)all(?:\s|$)/i);
      var all = m ? m[1] : undefined;
      var out = { records: [rec] };
      if (all === undefined) { out.status = 'warn'; out.found = 'SPF is set but doesn\'t end with an "all" rule.'; out.fix = 'End the record with ~all or -all so unlisted senders are flagged.'; return out; }
      if (all === '+' || all === '') { out.status = 'fail'; out.found = 'SPF allows anyone in the world to send as you (+all).'; out.fix = 'Change +all to ~all or -all.'; return out; }
      if (all === '?') { out.status = 'warn'; out.found = 'SPF is set but neutral (?all), so it doesn\'t protect you.'; out.fix = 'Change ?all to ~all or -all.'; return out; }
      if (provider && provider.key === 'google' && !/_spf\.google\.com/i.test(rec)) { out.status = 'warn'; out.found = 'SPF is set, but it doesn\'t include Google, which handles your mail.'; out.fix = 'Add include:_spf.google.com to the record.'; return out; }
      if (provider && provider.key === 'microsoft' && !/spf\.protection\.outlook\.com/i.test(rec)) { out.status = 'warn'; out.found = 'SPF is set, but it doesn\'t include Microsoft, which handles your mail.'; out.fix = 'Add include:spf.protection.outlook.com to the record.'; return out; }
      out.status = 'pass'; out.found = 'One valid SPF record.'; return out;
    });
  }

  function checkDkim(domain, provider) {
    if (provider && provider.key === 'cfrouting') {
      return Promise.resolve({ status: 'info', found: 'This domain only forwards incoming mail, so it doesn\'t send any mail to sign.', fix: 'If you start sending from this domain, add the DKIM key from your sending service.' });
    }
    var sels = DKIM_SELECTORS[(provider && DKIM_SELECTORS[provider.key]) ? provider.key : 'other'];
    return Promise.all(sels.map(function (s) {
      return lookup(s + '._domainkey.' + domain, 'TXT').then(function (r) {
        var ok = r.answers.some(function (a) { return a.type === TYPE.CNAME || /(^|;)\s*p=/.test(txtValue(a.data)) || /v=DKIM1/i.test(txtValue(a.data)); });
        return ok ? s : null;
      }).catch(function () { return null; });
    })).then(function (found) {
      found = found.filter(Boolean);
      if (found.length) return { status: 'pass', found: 'DKIM key found (' + found.join(', ') + ').' };
      var fix = provider && provider.key === 'google' ? 'Turn on DKIM in the Google Admin console (Apps > Gmail > Authenticate email) and add the record it gives you.'
        : provider && provider.key === 'microsoft' ? 'Turn on DKIM signing in the Microsoft Defender portal and add the two selector records it gives you.'
        : 'Ask your email provider for its DKIM record and add it to your DNS.';
      return { status: 'warn', found: 'We couldn\'t find a DKIM key under the usual names.', fix: 'Some providers use a custom name, so it may still be set. If not, this is a common reason for spam. ' + fix };
    });
  }

  function checkDmarc(domain) {
    return lookup('_dmarc.' + domain, 'TXT').then(function (r) {
      var recs = txtRecords(r).filter(function (t) { return /^v=DMARC1/i.test(t); });
      if (!recs.length) return { status: 'fail', found: 'No DMARC record found.', fix: 'Anyone can send mail pretending to be you, and Gmail and Yahoo expect DMARC from senders. Start with: v=DMARC1; p=none; rua=mailto:you@' + domain };
      if (recs.length > 1) return { status: 'fail', found: 'There are ' + recs.length + ' DMARC records.', records: recs, fix: 'Only one is allowed. Delete the extras.' };
      var rec = recs[0];
      var p = ((rec.match(/(?:^|;)\s*p\s*=\s*([a-z]+)/i) || [])[1] || '').toLowerCase();
      if (p === 'reject' || p === 'quarantine') return { status: 'pass', found: 'DMARC is set and enforced (p=' + p + ').', records: [rec] };
      if (p === 'none') return { status: 'warn', found: 'DMARC is set to monitoring only (p=none).', records: [rec], fix: 'Once reports show only your own services sending, change p=none to p=quarantine so fakes are stopped.' };
      return { status: 'fail', found: 'The DMARC record has no valid policy.', records: [rec], fix: 'Set p=none, p=quarantine or p=reject.' };
    });
  }

  // ---------- rendering ----------
  var ICON = {
    pass: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="currentColor"/><path d="M6 10.3l2.6 2.6L14 7.5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    warn: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.8l8.6 15.4H1.4z" fill="currentColor"/><path d="M10 7.5v4.2M10 14.3v.1" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
    fail: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="currentColor"/><path d="M7 7l6 6M13 7l-6 6" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
    info: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="currentColor"/><path d="M10 9v5M10 6.2v.1" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
    wait: ''
  };
  var WORD = { pass: 'Pass', warn: 'Needs work', fail: 'Problem', info: 'Not needed', wait: 'Checking…' };

  var CHECKS = [
    { key: 'mx', title: 'Receiving mail', what: 'MX records: where email for your domain is delivered.' },
    { key: 'spf', title: 'SPF', what: 'Lists the services allowed to send email as your domain.' },
    { key: 'dkim', title: 'DKIM', what: 'A digital signature that proves an email wasn\'t changed on the way.' },
    { key: 'dmarc', title: 'DMARC', what: 'Tells Gmail and Outlook what to do with mail that fails SPF or DKIM.' }
  ];

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function renderCheck(def, res) {
    var li = document.getElementById('chk-' + def.key);
    var st = res ? res.status : 'wait';
    var html = '<span class="badge ' + st + '">' + ICON[st] + WORD[st] + '</span><div><h3>' + esc(def.title) + '</h3><p class="what">' + esc(def.what) + '</p>';
    if (res) {
      html += '<p class="found">' + esc(res.found) + '</p>';
      if (res.records && res.records.length) html += '<p class="found">' + res.records.map(function (r) { return '<code>' + esc(r) + '</code>'; }).join(' ') + '</p>';
      if (res.fix && st !== 'pass') html += '<p class="fix">' + esc(res.fix) + '</p>';
    }
    li.innerHTML = html + '</div>';
  }

  function joinAnd(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }

  function failCheck(msg) { return { status: 'warn', found: msg || 'We couldn\'t complete this lookup.', fix: 'Try again in a moment.' }; }

  var els = {};
  function run(domain) {
    els.error.textContent = '';
    els.results.hidden = false;
    els.domainOut.textContent = domain;
    els.verdict.textContent = 'Checking…';
    els.next.hidden = true;
    CHECKS.forEach(function (c) { renderCheck(c, null); });
    els.button.disabled = true;

    var results = {};
    checkMx(domain).then(function (mx) {
      if (mx.nxdomain) {
        els.results.hidden = true;
        els.error.textContent = 'We couldn\'t find ' + domain + '. Check the spelling, or that the domain has been registered.';
        return null;
      }
      results.mx = mx; renderCheck(CHECKS[0], mx);
      var provider = mx.provider || null;
      return Promise.all([
        checkSpf(domain, provider).catch(function () { return failCheck(); }).then(function (r) { results.spf = r; renderCheck(CHECKS[1], r); }),
        checkDkim(domain, provider).catch(function () { return failCheck(); }).then(function (r) { results.dkim = r; renderCheck(CHECKS[2], r); }),
        checkDmarc(domain).catch(function () { return failCheck(); }).then(function (r) { results.dmarc = r; renderCheck(CHECKS[3], r); })
      ]).then(function () { return results; });
    }).then(function (res) {
      if (res) summarise(domain, res);
    }).catch(function () {
      els.results.hidden = true;
      els.error.textContent = 'We couldn\'t reach the DNS lookup service. Check your internet connection and try again.';
    }).then(function () { els.button.disabled = false; });
  }

  function summarise(domain, res) {
    var list = CHECKS.map(function (c) { return { def: c, r: res[c.key] }; });
    var ok = list.filter(function (x) { return x.r.status === 'pass' || x.r.status === 'info'; }).length;
    var fails = list.filter(function (x) { return x.r.status === 'fail'; });
    var warns = list.filter(function (x) { return x.r.status === 'warn'; });
    els.verdict.textContent = ok + ' of 4 checks passed. ' + (fails.length ? 'Some settings are missing, so your mail is more likely to land in spam or be faked.'
      : warns.length ? 'Mostly fine, with something worth tightening.' : 'Your email setup looks healthy.');

    var issues = fails.concat(warns);
    if (issues.length) {
      els.nextTitle.textContent = 'Want us to fix ' + (issues.length === 1 ? 'this' : 'these') + '?';
      els.nextText.textContent = 'Fixing ' + joinAnd(issues.map(function (x) { return x.def.title; })) + ' is part of our Starter package. We can usually do it without touching your website.';
      var msg = 'Hi Infrazz, I ran the Email Health Check on ' + domain + '. Issues: ' + issues.map(function (x) { return x.def.title + ' (' + WORD[x.r.status].toLowerCase() + ')'; }).join(', ') + '. Can you help fix them?';
      els.nextBtn.href = window.INFRAZZ.contactLink(msg, 'Email Health Check: ' + domain);
      els.nextBtnLabel.textContent = 'Fix this for me';
    } else {
      els.nextTitle.textContent = 'Looking good. What\'s next?';
      els.nextText.textContent = 'Next step for most small businesses: two-step sign-in, a password manager and backups. Our Secure Team package covers all three.';
      els.nextBtn.href = '/#packages';
      els.nextBtnLabel.textContent = 'See packages';
    }
    els.nextBtn.target = /^https:/.test(els.nextBtn.href) ? '_blank' : '';
    els.next.hidden = false;
  }

  function init() {
    els.form = document.getElementById('check-form');
    els.input = document.getElementById('domain');
    els.button = els.form.querySelector('button');
    els.error = document.getElementById('check-error');
    els.results = document.getElementById('results');
    els.domainOut = document.getElementById('result-domain');
    els.verdict = document.getElementById('verdict');
    els.next = document.getElementById('next');
    els.nextTitle = document.getElementById('next-title');
    els.nextText = document.getElementById('next-text');
    els.nextBtn = document.getElementById('next-btn');
    els.nextBtnLabel = document.getElementById('next-btn-label');

    els.form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = normalise(els.input.value);
      if (!d) { els.error.textContent = 'Enter a domain like yourbusiness.com.sg, or an email address.'; els.input.focus(); return; }
      els.input.value = d;
      history.replaceState(null, '', '?d=' + encodeURIComponent(d));
      run(d);
    });

    var q = new URLSearchParams(location.search).get('d');
    if (q) {
      els.input.value = q;
      var d = normalise(q);
      if (d) { els.input.value = d; run(d); } else { els.error.textContent = 'Enter a domain like yourbusiness.com.sg, or an email address.'; }
    }
  }

  // exposed for tests
  window.InfrazzCheck = { normalise: normalise, providerFromMx: providerFromMx, txtValue: txtValue, checkSpf: checkSpf, checkDmarc: checkDmarc, checkDkim: checkDkim, checkMx: checkMx, _setResolvers: function (r) { RESOLVERS = r; } };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
