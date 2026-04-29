// GoogleAdsUi.js
import UrlHandler from "../play/UrlHandler.js";

export default function GoogleAdsUi() {
  const site = UrlHandler.identifySite();

  // Skip ads for these sites
  const blockedSites = ["kongregate", "notdoppler", "armorgames"];//, "localhost"];
  if (blockedSites.includes(site)) return;

  const main = document.querySelector("#main");
  if (!main) return;

  // Insert ads
  main.insertAdjacentHTML("afterbegin", '<br style="clear:both" />');

  main.insertAdjacentHTML(
    "afterbegin",
    `<div style="float:right;width:320px;height:100px">
      <ins class="adsbygoogle"
        style="display:inline-block;width:320px;height:100px"
        data-ad-client="ca-pub-3638495999842466"
        data-ad-slot="8895924371"></ins>
    </div>`
  );

  main.insertAdjacentHTML(
    "afterbegin",
    `<div style="float:left;width:728px;height:90px">
      <ins class="adsbygoogle"
        style="display:inline-block;width:728px;height:90px"
        data-ad-client="ca-pub-3638495999842466"
        data-ad-slot="3835169385"></ins>
    </div>`
  );

  main.insertAdjacentHTML(
    "beforeend",
    `<div style="float:right;width:300px;height:600px">
      <ins class="adsbygoogle"
        style="display:inline-block;width:300px;height:600px"
        data-ad-client="ca-pub-3638495999842466"
        data-ad-slot="8374014348"></ins>
    </div>`
  );

  main.classList.add("mainWithAdd");

  // Keep factory grid (100dvh - inset) in sync with actual space used above #gameArea.
  const syncTopInset = () => {
    const gameArea = document.getElementById("gameArea");
    if (!gameArea) return;
    const t = gameArea.getBoundingClientRect().top;
    // On #main so it wins over :root; .factoryGrid inherits. Keeps layout height in sync with ad rows above #gameArea.
    main.style.setProperty("--main-top-inset", `${Math.max(0, Math.round(t))}px`);
  };
  const onResize = () => {
    syncTopInset();
  };
  window.addEventListener("resize", onResize, { passive: true });
  requestAnimationFrame(() => {
    requestAnimationFrame(syncTopInset);
  });

  // Initialize ads
  (adsbygoogle = window.adsbygoogle || []).push({});
  (adsbygoogle = window.adsbygoogle || []).push({});
  (adsbygoogle = window.adsbygoogle || []).push({});
}
