# Talise landing page (standalone)

The talise.io landing page on its own: a copy of `web/app/v5` from the Talise
repo and everything it needs (styles, flags, components).

```
npm install
npm run dev      # http://localhost:3020, live reload
npm run build    # production build
npm start        # serve the build on http://localhost:3020
```

- `app/v5/` — the page: hero globe, names, send, receive, product, the Talise
  card, send abroad, live numbers, close. `app/v5/page.tsx` composes it.
- `app/globals.css`, `app/site.css`, `app/v5/v5.css` — tokens and styles.
- `components/` — the site nav and footer, marks, motion helpers, card face.
- `public/` — flags (circle-flags, MIT) and the two images the page uses.

## Fonts

The page is set in SF Pro Rounded and Neue Montreal. Both are licensed, so
they aren't in this repo. To use them, put your own copies in `public/fonts/`:

```
SFProRounded-Regular.woff2
NeueMontreal-Light.woff2
NeueMontreal-Regular.woff2
NeueMontreal-Medium.woff2
NeueMontreal-Bold.woff2
```

Without them the page falls back to system fonts (on Apple devices,
`ui-rounded` is SF Pro Rounded already). See `app/fonts.css`.

The live numbers come from https://www.talise.io/api/analytics. Links to other
pages (Support, Blog, Privacy, Terms) go to talise.io; "Get started" and
"Log in" go to app.talise.io.

This is a copy: changes made here don't reach the repo (and the reverse).
