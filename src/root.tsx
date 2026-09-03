import { component$ } from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";
import { assetPath } from "./lib/assets";
import { PREPAINT_SCRIPT, THEME_COLORS } from "./lib/theme";

import "./global.css";

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Don't remove the `<head>` and `<body>` elements.
   */

  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        {/* Marks JS availability before first paint so CSS can stage
            entrance-animation initial states without hiding content from
            no-JS visitors (crawlers, reader modes). */}
        <script dangerouslySetInnerHTML="document.documentElement.classList.add('js')" />
        {/* theme-color must precede the pre-paint script, which rewrites it. */}
        <meta name="theme-color" content={THEME_COLORS.dark} />
        {/* Resolves stored/OS theme onto <html data-theme> before first
            paint so the SSR'd page never flashes the wrong theme. */}
        <script dangerouslySetInnerHTML={PREPAINT_SCRIPT} />
        <link rel="icon" href={assetPath("favicon.ico")} sizes="32x32" />
        <link
          rel="icon"
          href={assetPath("icon-192.png")}
          type="image/png"
          sizes="192x192"
        />
        <link rel="apple-touch-icon" href={assetPath("apple-touch-icon.png")} />
        <RouterHead />
      </head>
      <body lang="en">
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
