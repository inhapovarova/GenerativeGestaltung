(function () {
  const links = [
    { href: "single-building.html", label: "single building" },
    { href: "poster-generator.html", label: "create poster" },
    { href: "random-street.html", label: "random street" },
    { href: "index.html", label: "sandbox" },
    { href: "gallery.html", label: "gallery" },
  ];

  function initSharedNav() {
    if (document.querySelector(".shared-nav-root")) return;

    const root = document.createElement("div");
    root.className = "shared-nav-root";

    const menuButton = document.createElement("button");
    menuButton.className = "shared-nav-button";
    menuButton.type = "button";
    menuButton.textContent = "menu";
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-controls", "shared-nav-panel");

    const panel = document.createElement("nav");
    panel.className = "shared-nav-panel";
    panel.id = "shared-nav-panel";
    panel.setAttribute("aria-label", "site navigation");

    links.forEach((link) => {
      const item = document.createElement("a");
      item.href = link.href;
      item.textContent = link.label;
      panel.appendChild(item);
    });

    menuButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = panel.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", (event) => {
      if (!root.contains(event.target)) {
        panel.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        panel.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
      }
    });

    root.append(menuButton, panel);
    document.body.appendChild(root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSharedNav);
  } else {
    initSharedNav();
  }
})();
