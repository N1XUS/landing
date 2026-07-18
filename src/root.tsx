import { component$ } from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";
import { assetPath } from "./lib/assets";

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
        <link rel="icon" href={assetPath("favicon.ico")} sizes="32x32" />
        <link
          rel="icon"
          href={assetPath("icon-192.png")}
          type="image/png"
          sizes="192x192"
        />
        <link rel="apple-touch-icon" href={assetPath("apple-touch-icon.png")} />
        <meta name="theme-color" content="#171717" />
        <RouterHead />
      </head>
      <body lang="en">
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
