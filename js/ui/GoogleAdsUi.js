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
        data-ad-client="ca-pub-2388056053538220"
        data-ad-slot="4288235097"></ins>
    </div>`
  );

  main.insertAdjacentHTML(
    "afterbegin",
    `<div style="float:left;width:728px;height:90px">
      <ins class="adsbygoogle"
        style="display:inline-block;width:728px;height:90px"
        data-ad-client="ca-pub-2388056053538220"
        data-ad-slot="2811501890"></ins>
    </div>`
  );

  main.insertAdjacentHTML(
    "beforeend",
    `<div style="float:right;width:300px;height:600px">
      <ins class="adsbygoogle"
        style="display:inline-block;width:300px;height:600px"
        data-ad-client="ca-pub-2388056053538220"
        data-ad-slot="1334768690"></ins>
    </div>`
  );

  main.classList.add("mainWithAdd");

  // Initialize ads
  window.adsbygoogle = window.adsbygoogle || [];
  window.adsbygoogle.push({});
  window.adsbygoogle.push({});
  window.adsbygoogle.push({});
}
