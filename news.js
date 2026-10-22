(function () {
  var C = window.NOLRO || {}, U = C.SUPABASE_URL || '', K = C.SUPABASE_ANON_KEY || '';
  var live = U && !/YOUR-/.test(U);
  var list = document.getElementById('article-list');
  var form = document.getElementById('subscribe');
  var msg = document.getElementById('nl-msg');
  function say(t, bad) { msg.textContent = t; msg.style.color = bad ? '#FFB4A8' : '#E0A93B'; }

  // Latest articles: the static rows act as the template and as the fallback.
  if (live && list) {
    fetch(U + '/rest/v1/articles?select=slug,title,category,image_url,created_at&published=eq.true&order=created_at.desc&limit=6', { headers: { apikey: K } })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (rows) {
        var tpl = list.querySelector('a'); if (!tpl) return;
        list.innerHTML = '';
        if (!rows.length) {
          var p = document.createElement('p');
          p.textContent = 'No bulletins have been published yet. Check back soon.';
          p.style.cssText = 'margin:0;padding:32px 0;color:#4B5665;font-size:17px';
          list.appendChild(p); return;
        }
        rows.forEach(function (a) {
          var r = tpl.cloneNode(true), img = r.querySelector('img'), sp = r.querySelectorAll(':scope>span');
          r.href = 'article.html?slug=' + encodeURIComponent(a.slug);
          img.src = a.image_url || 'logo.png'; img.alt = '';
          if (!a.image_url) { img.style.objectFit = 'contain'; img.style.background = '#fff'; img.style.border = '1px solid #E3E1DA'; }
          sp[0].textContent = new Date(a.created_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
          sp[1].textContent = a.category; sp[2].textContent = a.title;
          list.appendChild(r);
        });
      }).catch(function () {});
  }

  // Subscribe form + messages after clicking links in emails
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!live) { say('Email subscriptions are not switched on yet.', true); return; }
      var em = document.getElementById('nl-email'), btn = form.querySelector('button');
      if (!em.checkValidity()) { say('Please enter a valid email address.', true); em.focus(); return; }
      btn.disabled = true; say('Sending…');
      fetch(U + '/functions/v1/newsletter', {
        method: 'POST', headers: { 'Content-Type': 'application/json', apikey: K },
        body: JSON.stringify({ action: 'subscribe', email: em.value, website: form.elements.website.value })
      }).then(function (r) { return r.json(); }).then(function (d) {
        if (d.error) say(d.error, true); else { say('Almost done. Check your inbox for a confirmation email.'); em.value = ''; }
      }).catch(function () { say('Something went wrong. Please try again.', true); })
        .then(function () { btn.disabled = false; });
    });
    var m = new URLSearchParams(location.search).get('newsletter');
    var t = { confirmed: 'You are subscribed. Thank you.', unsubscribed: 'You have been unsubscribed.', invalid: 'That link is no longer valid.' };
    if (m && t[m]) say(t[m], m === 'invalid');
  }
})();
