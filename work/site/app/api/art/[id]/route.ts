import blueprint from "../../../../public/pumpios/trait-blueprint.json";

export const dynamic = "force-dynamic";

const ID_PATTERN = /^PUMPIO-(\d{4})$/;
const items = new Map(blueprint.items.map((item) => [item.serial, item]));

function esc(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character] ?? character);
}

function palette(capsule: string) {
  if (/Red/i.test(capsule)) return { top: "#f2eadc", base: "#ef4b42", light: "#ff8a79" };
  if (/Blue|Liquid|Frost/i.test(capsule)) return { top: "#d9f4ff", base: "#43aee8", light: "#9ee4ff" };
  if (/Pink/i.test(capsule)) return { top: "#fff0e9", base: "#f368a5", light: "#ffafd0" };
  if (/Black|Burned|Smoked/i.test(capsule)) return { top: "#2b2a29", base: "#111311", light: "#6df08b" };
  if (/Gold/i.test(capsule)) return { top: "#ffe498", base: "#d8a629", light: "#fff0a5" };
  if (/Chrome|Holographic/i.test(capsule)) return { top: "#edf1ee", base: "#8aa4a8", light: "#f8c9ff" };
  if (/Radioactive/i.test(capsule)) return { top: "#d9ff7c", base: "#7bff3a", light: "#f4ff9b" };
  return { top: "#f3eddf", base: "#48c957", light: "#9df58c" };
}

function backgroundColor(background: string) {
  if (/red|closing|street/i.test(background)) return "#d9443d";
  if (/blue|night|quant|yacht/i.test(background)) return "#5dbbe9";
  if (/pink/i.test(background)) return "#ef80ae";
  if (/yellow|gold|vault|printing/i.test(background)) return "#e6bf45";
  if (/black|server|underwriting|boardroom/i.test(background)) return "#171916";
  return "#9bed82";
}

function outfitColor(outfit: string) {
  if (/gray|lab|hospital/i.test(outfit)) return "#737773";
  if (/green|hazmat/i.test(outfit)) return "#398f4c";
  if (/tracksuit|puffer/i.test(outfit)) return "#273b2e";
  if (/gold/i.test(outfit)) return "#c99824";
  if (/bathrobe|fur/i.test(outfit)) return "#eee4d1";
  return "#161817";
}

function backgroundMarks(artifact: string, accent: string) {
  const chart = `<path d="M90 430 L188 360 L274 398 L369 235 L451 292 L545 160 L650 236 L760 118 L894 206 L1040 91" fill="none" stroke="${accent}" stroke-width="19" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (/candle/i.test(artifact)) return `${chart}<g fill="${accent}"><rect x="170" y="195" width="34" height="120"/><rect x="356" y="115" width="34" height="156"/><rect x="735" y="60" width="34" height="136"/></g>`;
  if (/ladder|grid/i.test(artifact)) return `<g stroke="${accent}" stroke-width="9" opacity=".7"><path d="M80 180H380M80 260H320M80 340H410M820 170H1110M875 250H1110M790 330H1110"/><path d="M150 80V500M250 80V500M950 80V500M1050 80V500"/></g>`;
  if (/bell/i.test(artifact)) return `<path d="M165 408 Q205 250 330 238 Q455 250 495 408 Z M205 428H455" fill="none" stroke="${accent}" stroke-width="18"/>`;
  return chart;
}

function headwear(name: string, accent: string) {
  if (/None/i.test(name)) return "";
  if (/halo/i.test(name)) return `<ellipse cx="600" cy="194" rx="205" ry="52" fill="none" stroke="${accent}" stroke-width="19"/>`;
  if (/antenna|sensor/i.test(name)) return `<path d="M600 215V100M545 92H655" stroke="${accent}" stroke-width="20" stroke-linecap="round"/><circle cx="600" cy="72" r="27" fill="${accent}" stroke="#101210" stroke-width="13"/>`;
  if (/bandage/i.test(name)) return `<path d="M430 285L552 226L589 301L466 360Z" fill="#ead8bd" stroke="#101210" stroke-width="14"/><path d="M482 282l40 5" stroke="#b79f80" stroke-width="10"/>`;
  if (/headset/i.test(name)) return `<path d="M389 385Q398 202 600 190Q802 202 811 385" fill="none" stroke="#101210" stroke-width="29"/><rect x="365" y="357" width="63" height="112" rx="25" fill="${accent}" stroke="#101210" stroke-width="14"/><path d="M399 441Q420 500 493 494" fill="none" stroke="#101210" stroke-width="17"/>`;
  if (/cowboy/i.test(name)) return `<path d="M365 275Q420 126 600 149Q780 126 835 275Q738 332 600 318Q462 332 365 275Z" fill="#9a6336" stroke="#101210" stroke-width="18"/><path d="M284 308Q600 367 916 308" fill="none" stroke="#101210" stroke-width="28"/>`;
  if (/crown/i.test(name)) return `<path d="M495 238L516 123L590 197L661 110L696 222L763 151L744 267Z" fill="#f0c43c" stroke="#101210" stroke-width="17"/>`;
  return `<path d="M392 286Q425 145 606 156Q777 162 817 299L743 315Q609 255 399 306Z" fill="#151716" stroke="#101210" stroke-width="18"/><path d="M725 292Q833 280 894 330Q790 349 711 329" fill="#151716" stroke="#101210" stroke-width="15"/><text x="564" y="241" fill="${accent}" font-family="Arial,sans-serif" font-size="48" font-weight="900">IPO</text>`;
}

function eyewear(name: string, accent: string) {
  if (/None/i.test(name)) return "";
  if (/monocle|scanner/i.test(name)) return `<circle cx="687" cy="520" r="63" fill="none" stroke="${accent}" stroke-width="18"/><path d="M742 556l48 106" stroke="${accent}" stroke-width="14"/>`;
  return `<path d="M427 484Q504 448 568 487L554 566Q478 593 424 545Z M633 487Q704 449 778 483L777 545Q716 590 644 560Z" fill="${/shade|goggle|visor/i.test(name) ? "#111413" : "#b9ebd9"}" fill-opacity=".82" stroke="#101210" stroke-width="16"/><path d="M566 507Q600 489 637 508" fill="none" stroke="#101210" stroke-width="16"/>`;
}

function heldItem(name: string, accent: string) {
  if (/None/i.test(name)) return "";
  if (/coffee|drink/i.test(name)) return `<g transform="translate(845 880) rotate(5)"><path d="M0 0H142L124 212H18Z" fill="#eee5d5" stroke="#101210" stroke-width="16"/><path d="M-5 37H148" stroke="${accent}" stroke-width="27"/><text x="35" y="125" font-family="Arial,sans-serif" font-size="32" font-weight="900">IPO</text></g>`;
  if (/phone/i.test(name)) return `<g transform="translate(863 838) rotate(8)"><rect width="125" height="238" rx="22" fill="#111413" stroke="#101210" stroke-width="16"/><rect x="21" y="31" width="83" height="137" fill="${accent}"/><path d="M35 142L56 101L76 119L98 69" fill="none" stroke="#101210" stroke-width="11"/></g>`;
  if (/briefcase/i.test(name)) return `<g transform="translate(796 900)"><rect width="250" height="154" rx="16" fill="#633e29" stroke="#101210" stroke-width="17"/><path d="M78 0V-48H171V0M0 66H250" fill="none" stroke="#101210" stroke-width="16"/></g>`;
  return `<g transform="translate(820 852) rotate(-7)"><rect width="224" height="274" fill="#f2eadb" stroke="#101210" stroke-width="16"/><text x="28" y="61" font-family="Arial,sans-serif" font-size="28" font-weight="900">PROSPECTUS</text><path d="M28 94H191M28 126H176M28 158H190M28 190H155" stroke="#101210" stroke-width="10"/></g>`;
}

function renderSvg(item: (typeof blueprint.items)[number], level: number) {
  const traits = item.traits;
  const colors = palette(traits.capsule);
  const bg = backgroundColor(traits.background);
  const suit = outfitColor(traits.outfit);
  const accent = /black|server|boardroom|underwriting/i.test(traits.background) ? "#9bff54" : "#173b20";
  const eyeShift = /Side-eye/i.test(traits.eyes) ? 18 : /Monday/i.test(traits.eyes) ? -10 : 0;
  const eyeColor = /Gold/i.test(traits.eyes) ? "#ffcf3e" : /Radioactive|Blue screen|Ticker/i.test(traits.eyes) ? colors.light : "#101210";
  const mouth = /smug/i.test(traits.face) ? "M574 638Q626 664 678 627" : /stitched/i.test(traits.face) ? "M566 640H675M585 620V657M615 620V657M646 620V657" : /cry/i.test(traits.face) ? "M574 655Q620 616 670 655" : "M584 646Q620 638 655 643";
  const levelBars = Array.from({ length: level }, (_, index) => `<rect x="${90 + index * 31}" y="1086" width="20" height="${28 + index * 4}" fill="#9bff54"/>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200" role="img" aria-label="${esc(item.name)}">
  <defs>
    <filter id="rough" x="-8%" y="-8%" width="116%" height="116%"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="2" seed="${item.serial}" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="4"/></filter>
    <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency=".62" numOctaves="3" seed="${item.serial + 41}" result="grain"/><feColorMatrix in="grain" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 .16 0"/></filter>
    <clipPath id="capsule"><rect x="366" y="142" width="468" height="627" rx="224"/></clipPath>
  </defs>
  <rect width="1200" height="1200" fill="${bg}"/>
  <g opacity=".25" stroke="${accent}" stroke-width="4"><path d="M0 120H1200M0 240H1200M0 360H1200M0 480H1200M0 600H1200M0 720H1200M0 840H1200M0 960H1200"/><path d="M120 0V1200M240 0V1200M360 0V1200M480 0V1200M600 0V1200M720 0V1200M840 0V1200M960 0V1200M1080 0V1200"/></g>
  <g opacity=".54" filter="url(#rough)">${backgroundMarks(traits.marketArtifact, accent)}</g>
  <path d="M164 1200Q202 850 412 778Q504 748 600 748Q696 748 788 778Q998 850 1036 1200Z" fill="${suit}" stroke="#101210" stroke-width="29" filter="url(#rough)"/>
  <path d="M423 786L570 1132L344 986ZM777 786L630 1132L856 986Z" fill="#252925" stroke="#101210" stroke-width="21" filter="url(#rough)"/>
  <path d="M508 776L600 864L692 776L667 981L600 1065L531 981Z" fill="#f0e9da" stroke="#101210" stroke-width="18" filter="url(#rough)"/>
  <path d="M576 871L624 871L657 1034L600 1102L543 1034Z" fill="${colors.base}" stroke="#101210" stroke-width="16" filter="url(#rough)"/>
  <rect x="548" y="708" width="104" height="144" rx="35" fill="${colors.base}" stroke="#101210" stroke-width="25"/>
  <g clip-path="url(#capsule)" filter="url(#rough)"><rect x="366" y="142" width="468" height="627" rx="224" fill="${colors.base}"/><path d="M340 140H858V443Q620 385 340 455Z" fill="${colors.top}"/><path d="M393 438Q602 377 817 438" fill="none" stroke="#101210" stroke-width="25"/><path d="M405 230Q535 158 703 190" fill="none" stroke="#fff" stroke-opacity=".56" stroke-width="24" stroke-linecap="round"/><path d="M735 260Q790 364 768 432" fill="none" stroke="#fff" stroke-opacity=".48" stroke-width="18" stroke-linecap="round"/></g>
  <rect x="366" y="142" width="468" height="627" rx="224" fill="none" stroke="#101210" stroke-width="30" filter="url(#rough)"/>
  ${headwear(traits.headwear, accent)}
  <g filter="url(#rough)"><path d="M449 ${519 + eyeShift}Q500 ${492 + eyeShift} 553 ${516 + eyeShift}Q505 ${575 + eyeShift} 449 ${519 + eyeShift}Z" fill="${eyeColor}"/><path d="M647 ${516 - eyeShift}Q704 ${490 - eyeShift} 757 ${516 - eyeShift}Q704 ${574 - eyeShift} 647 ${516 - eyeShift}Z" fill="${eyeColor}"/><path d="${mouth}" fill="none" stroke="#101210" stroke-width="17" stroke-linecap="round"/></g>
  ${eyewear(traits.eyewear, accent)}
  ${heldItem(traits.heldItem, accent)}
  <g filter="url(#rough)"><rect x="172" y="950" width="230" height="76" rx="8" fill="#f3ecdc" stroke="#101210" stroke-width="14"/><text x="196" y="999" fill="#101210" font-family="Arial,sans-serif" font-size="28" font-weight="900">PUMPIOS</text></g>
  <g fill="#101210" font-family="Arial,sans-serif" font-weight="900"><text x="76" y="91" font-size="31">INITIAL PUMP OFFERING</text><text x="880" y="91" font-size="31">#${String(item.serial).padStart(4, "0")}</text></g>
  <rect x="66" y="1062" width="1068" height="88" fill="#101210"/><text x="86" y="1118" fill="#f4efe3" font-family="Arial,sans-serif" font-size="28" font-weight="900">${esc(item.rarity)} · LEVEL ${level} · ${esc(traits.statusDetail.toUpperCase())}</text>${levelBars}
  <rect width="1200" height="1200" filter="url(#paper)" opacity=".52"/>
</svg>`;
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const match = ID_PATTERN.exec(id);
  const serial = match ? Number(match[1]) : 0;
  const item = items.get(serial);
  if (!item) return new Response("Unknown Pumpio", { status: 404 });
  const levelValue = Number(new URL(request.url).searchParams.get("level") ?? "0");
  const level = Number.isInteger(levelValue) ? Math.min(10, Math.max(0, levelValue)) : 0;
  return new Response(renderSvg(item, level), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
