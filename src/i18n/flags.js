// Inline SVG flags for the language switch (emoji flags don't render on Windows).
// Plain strings so both React (LanguageSwitch.jsx) and the static blog templates (Node) can use them.
// No ids/clipPaths: the same flag appears several times per page.

const box = (viewBox, inner, extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="20" height="14" ${extra} aria-hidden="true" focusable="false" class="lang-flag">${inner}</svg>`;

// Spain (civil flag): red / yellow (double height) / red.
const ES = box(
  "0 0 3 2",
  '<rect width="3" height="2" fill="#AA151B"/><rect y=".5" width="3" height="1" fill="#F1BF00"/>'
);

// United Kingdom (en-GB is the site's English locale). Cropped to the switch's 10:7 box.
const EN = box(
  "0 0 60 30",
  '<rect width="60" height="30" fill="#012169"/>' +
    '<path d="M0 0 60 30M60 0 0 30" stroke="#fff" stroke-width="6"/>' +
    '<path d="M0 0 60 30M60 0 0 30" stroke="#C8102E" stroke-width="2"/>' +
    '<path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/>' +
    '<path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"/>',
  'preserveAspectRatio="xMidYMid slice"'
);

export const FLAGS = { en: EN, es: ES };
