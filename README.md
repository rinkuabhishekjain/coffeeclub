# Coffeeclub.in

A simple, static website for India's premier coffee community.

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom styles with Coffee & Cream design system
- **Vanilla JavaScript** - Interactive features (calculator, quiz, newsletter)

## Structure

```
coffeeclub/
├── index.html          # Homepage
├── blog.html           # Blog listing page
├── tools.html          # Tools listing page
├── styles.css          # Main stylesheet
├── script.js           # Main JavaScript
├── blog/               # Blog post HTML files
│   ├── moka-pot-vs-aeropress.html
│   ├── araku-valley-spotlight.html
│   └── timing-caffeine-for-engineers.html
├── tools/              # Interactive tools
│   ├── calculator.html
│   ├── quiz.html
│   └── quiz.js
└── public/
    └── images/         # Images (logo, hero background)
```

## Features

- **Homepage** - Hero section, features grid, tools preview
- **Blog** - Category-based blog posts (Guides, Heritage, Wellness)
- **Interactive Tools**:
  - Coffee-to-Water Calculator
  - Roast Finder Quiz
- **Newsletter** - Simple email subscription form

## Design System

- **Deep Espresso** (#2C1810) - Primary text
- **Warm Oat** (#F5E6D3) - Backgrounds, muted elements
- **Burnt Orange** (#D2691E) - Accent color
- **Cream** (#FFFDFA) - Main background
- **Mocha** (#654321) - Secondary text

## Running Locally

Simply open `index.html` in a web browser, or use a local server:

```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server

# PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

## Deployment

This is a static website that can be deployed to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- Any web server

Just upload all files to your hosting service.
