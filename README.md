# progressarenda.com

Статическая HTML-версия сайта «Прогресс» (девелопер коммерческой недвижимости в Казани), бывший WordPress (тема Envision).

```
index.html, upravlenie/, contacts/   страницы
css/  js/  images/  fonts/  docs/    стили, скрипты, изображения, шрифты, документы
functions/api/contact.js             Cloudflare Pages Function — форма обратной связи
404.html                             страница 404
```

## Деплой (Cloudflare Pages)

Подключить репозиторий; Build command — пусто, Output directory — `/`.

Переменные окружения (Settings → Environment variables):

| Имя | Значение |
| --- | --- |
| `RESEND_API_KEY` | API-ключ [Resend](https://resend.com) (Secret) |
| `MAIL_TO` | куда слать письма, напр. `progressarenda@mail.ru` (можно несколько через запятую) |
| `MAIL_FROM` | отправитель на домене, подтверждённом в Resend, напр. `Прогресс <noreply@progressarenda.com>` |

Локальный запуск вместе с функцией: `npx wrangler pages dev .` (переменные — в `.dev.vars`, см. `.dev.vars.example`).
