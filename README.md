# Amanuel Fesseha Portfolio

A fast static portfolio that deploys on GitHub Pages. No build tools, just HTML, CSS, and JS.

## Quick start

1. Download this folder or clone the repo after you push it to GitHub.
2. Edit `index.html` for your name, bio, contact, and sections.
3. Edit `projects.json` to list your projects.
4. Push to GitHub and enable Pages.

## Deploy on GitHub Pages

- Create a new repo on GitHub named `portfolio` or any name you like.
- Push this folder to `main`.
- In Settings, Pages, choose **Deploy from a branch**, set Branch to `main`, folder to `/root`.
- Save. Your site will be live at the URL shown in the Pages section.

You can also use the included GitHub Actions workflow. It uploads the static files to Pages on every push to `main`.

## Local preview

Just open `index.html` in a browser. If you hit CORS issues when loading `projects.json`, start a simple server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Customize

- Colors and layout are in `styles.css`.
- Projects data is in `projects.json`.
- Add images in the `assets` folder and link them in your cards.

## License

MIT, see `LICENSE`.
