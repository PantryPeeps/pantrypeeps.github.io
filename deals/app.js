"use strict";

const categories = ["Pantry Food", "Pets", "Household", "Hygiene"];
const pricingLabel = "Check today’s pricing for the item";
const weekPanel = document.querySelector("#weeks");
const count = document.querySelector("#result-count");
const buttons = [...document.querySelectorAll("[data-store]")];
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
let store = "all";
let deals = [];

function element(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content) node.textContent = content;
  return node;
}

function weekLabel(isoDate) {
  const start = new Date(isoDate + "T00:00:00Z");
  return "Week of " + dateFormat.format(start);
}

function copyCardLink(deal, button, status) {
  const cardUrl = new URL("https://pantrypeeps.org/deals/");
  cardUrl.hash = deal.slug;
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(cardUrl.href);
      status.textContent = "Link copied";
    } catch {
      window.prompt("Copy this card link", cardUrl.href);
    }
  });
}

function dealCard(deal) {
  const card = element("article", "card");
  card.id = deal.slug;
  if (deal.image) {
    const product = element("div", "product");
    const img = element("img");
    img.src = deal.image;
    img.alt = "";
    img.loading = "lazy";
    product.append(img);
    card.append(product);
  } else {
    card.append(element("div", "product-empty"));
  }

  const body = element("div", "card-content");
  body.append(
    element("span", "store " + deal.retailer.toLowerCase(), deal.retailer),
    element("h4", "", deal.title),
    element("p", "size", deal.size),
    element("p", "note", deal.note)
  );
  body.append(element("p", "pricing-label", pricingLabel));
  const action = element("div", "card-action");
  if (deal.url) {
    const link = element("a", "retailer-link", "Check Today’s Price on " + deal.retailer);
    link.href = deal.url;
    link.target = "_blank";
    link.rel = "nofollow sponsored noopener";
    action.append(link);
    if (deal.affiliate) action.append(element("span", "ad", "#ad"));
  } else {
    action.append(element("span", "pending", "Retailer link pending"));
  }
  body.append(action);
  const copy = element("button", "copy-link", "Copy Card Link");
  copy.type = "button";
  const status = element("span", "copy-status");
  status.setAttribute("role", "status");
  copyCardLink(deal, copy, status);
  body.append(copy, status);
  card.append(body);
  return card;
}

function render() {
  const visibleDeals = deals.filter(deal => store === "all" || store === deal.retailer);
  const weeks = [...new Set(visibleDeals.map(deal => deal.week))].sort().reverse();
  count.textContent = visibleDeals.length + (visibleDeals.length === 1 ? " deal" : " deals");
  buttons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.store === store)));
  weekPanel.replaceChildren();
  if (weeks.length === 0) {
    weekPanel.append(element("p", "empty", "No deals for this store yet."));
  }

  for (const week of weeks) {
    const section = element("section", "week");
    const heading = element("h2", "week-title", weekLabel(week));
    heading.id = "week-" + week;
    section.setAttribute("aria-labelledby", heading.id);
    section.append(heading);

    for (const category of categories) {
      const groupDeals = visibleDeals.filter(deal => deal.week === week && deal.category === category);
      if (groupDeals.length === 0) continue;
      const group = element("section", "group");
      const grid = element("div", "grid");
      group.append(element("h3", "", category), grid);
      groupDeals.forEach(deal => grid.append(dealCard(deal)));
      section.append(group);
    }
    weekPanel.append(section);
  }
}

function showLinkedDeal() {
  const id = location.hash.slice(1);
  if (!/^[-a-z0-9]+$/.test(id)) return;
  const deal = deals.find(item => item.slug === id);
  if (!deal) return;
  if (store !== "all" && store !== deal.retailer) {
    store = "all";
    render();
  }
  const card = document.getElementById(id);
  if (!card) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  card.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "start" });
  card.classList.add("linked-card");
  setTimeout(() => card.classList.remove("linked-card"), 2500);
}

async function start() {
  const inlineData = document.querySelector("#preview-deals");
  try {
    if (inlineData) {
      deals = JSON.parse(inlineData.textContent);
    } else {
      const response = await fetch("deals.json");
      if (!response.ok) throw new Error("Deal data could not be downloaded");
      deals = await response.json();
    }
  } catch {
    count.textContent = "Deals couldn’t load. Refresh to try again.";
    return;
  }
  render();
  showLinkedDeal();
}

buttons.forEach(button => button.addEventListener("click", () => {
  store = button.dataset.store;
  if (location.hash && !["#deals", "#"].includes(location.hash)) {
    history.replaceState(null, "", "#deals");
  }
  render();
}));
window.addEventListener("hashchange", showLinkedDeal);
start();
