// Contact form: posts to the Cloudflare Pages Function /api/contact
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var out = form.querySelector('.wpcf7-response-output');
  var button = form.querySelector('input[type="submit"]');
  var MSG = {
    ok: 'Спасибо за Ваше сообщение. Оно успешно отправлено.',
    invalid: 'Пожалуйста, заполните имя и укажите e-mail или телефон.',
    error: 'Не удалось отправить сообщение. Попробуйте позже или позвоните нам.'
  };

  function show(cls, text) {
    out.className = 'wpcf7-response-output ' + cls;
    out.textContent = text;
    out.style.display = 'block';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.elements['your-name'].value.trim();
    var contact = form.elements['your-email'].value.trim();
    if (!name || !contact) return show('wpcf7-validation-errors', MSG.invalid);

    button.disabled = true;
    fetch(form.getAttribute('action'), { method: 'POST', body: new FormData(form) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (res.ok && res.d.status === 'ok') { form.reset(); show('wpcf7-mail-sent-ok', MSG.ok); }
        else show(res.d.status === 'invalid' ? 'wpcf7-validation-errors' : 'wpcf7-mail-sent-ng', res.d.status === 'invalid' ? MSG.invalid : MSG.error);
      })
      .catch(function () { show('wpcf7-mail-sent-ng', MSG.error); })
      .then(function () { button.disabled = false; });
  });
})();
