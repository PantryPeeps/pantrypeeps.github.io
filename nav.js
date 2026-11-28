(function () {
      const path = window.location.pathname.replace(/\/index\.html$/, "/");
      const isPreview = Boolean(document.querySelector(".preview-bar"));
      if (!isPreview && (path === "/" || path === "")) return;

      const HUBS = [
        { title: "Deals", href: "/deals/" },
        { title: "716 Pantry Map", href: "/map/" },
        { title: "How to Give", href: "/how-to-give/" },
        { title: "Recipes", href: "/recipes/" },
        { title: "The Pantry Playbook", href: "/playbook/" },
        { title: "Storefront", href: "/storefront/" },
        { title: "Community Resources", href: "/resources/" },
        { title: "Understanding Food Insecurity", href: "/food-insecurity/" },
        { title: "Pantry Builds", href: "/builds/" },
        { title: "Steward Stories", href: "/stories/" }
      ];

      document.querySelectorAll(".pp-sub-header, .pp-sub-footer, .pp-sub-top-btn").forEach((el) => el.remove());

      let activeHref = isPreview ? "/builds/" : path;

      function renderDropdownLinks(currentHref) {
        return HUBS.map((hub) => {
          const isActive = currentHref === hub.href || currentHref.startsWith(hub.href);
          return `<a class="pp-dropdown-link${isActive ? " is-active" : ""}" href="${hub.href}" data-hub-title="${hub.title}" data-hub-href="${hub.href}">
            <span>${hub.title}</span>
          </a>`;
        }).join("");
      }

      const header = document.createElement("header");
      header.className = "pp-sub-header";
      header.innerHTML = `
        <div class="pp-sub-inner">
          <div class="pp-sub-left">
            <button type="button" class="pp-back-btn" id="ppBackBtn" aria-label="Go back">&larr; Back</button>
            <div class="pp-nav-dropdown">
              <button type="button" class="pp-menu-toggle" id="ppMenuToggle" aria-expanded="false" aria-controls="ppDropdownList">
                <span class="pp-menu-icon" aria-hidden="true">&#9776;</span>
                <span>All Pages</span>
                <span class="pp-menu-caret" aria-hidden="true">&#9660;</span>
              </button>
              <nav class="pp-dropdown-list" id="ppDropdownList" aria-label="Pantry Peeps Pages">
                ${renderDropdownLinks(activeHref)}
              </nav>
            </div>
          </div>
          <div class="pp-sub-center">
            <a class="pp-brand-link" href="/">Pantry Peeps</a>
          </div>
          <div class="pp-sub-right">
            <div class="pp-sub-socials">
              <a class="pp-social-pill yt" href="https://www.youtube.com/@PantryPeeps" target="_blank" rel="noopener" aria-label="YouTube @PantryPeeps">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/>
                </svg>
                <span>@PantryPeeps</span>
              </a>
              <a class="pp-social-pill fb" href="https://www.facebook.com/profile.php?id=100069055890254" target="_blank" rel="noopener" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/>
                </svg>
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>
      `;

      const previewBar = document.querySelector(".preview-bar");
      if (previewBar) {
        previewBar.insertAdjacentElement("afterend", header);
      } else {
        document.body.prepend(header);
      }

      const menuToggle = document.getElementById("ppMenuToggle");
      const dropdownList = document.getElementById("ppDropdownList");

      menuToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = dropdownList.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
      });

      document.addEventListener("click", (e) => {
        if (!header.contains(e.target)) {
          dropdownList.classList.remove("is-open");
          menuToggle.setAttribute("aria-expanded", "false");
        }
      });

      if (isPreview) {
        dropdownList.addEventListener("click", (e) => {
          const link = e.target.closest(".pp-dropdown-link");
          if (!link) return;
          e.preventDefault();
          activeHref = link.dataset.hubHref;
          dropdownList.innerHTML = renderDropdownLinks(activeHref);
          dropdownList.classList.remove("is-open");
          menuToggle.setAttribute("aria-expanded", "false");
          const heading = document.getElementById("previewPageHeading");
          const desc = document.getElementById("previewPageDesc");
          if (heading) heading.textContent = link.dataset.hubTitle;
          if (desc) desc.innerHTML = `Active route: <strong>${activeHref}</strong>`;
        });
      }

      const backBtn = document.getElementById("ppBackBtn");
      backBtn.addEventListener("click", () => {
        const referrer = document.referrer;
        let sameSiteReferrer = null;

        try {
          const candidate = new URL(referrer);
          if (candidate.origin === window.location.origin) {
            sameSiteReferrer = candidate.href;
          }
        } catch (_) {
          // No usable referrer; handle this as a direct visit below.
        }

        if (sameSiteReferrer && window.history.length > 1) {
          window.history.back();
          return;
        }

        if (sameSiteReferrer) {
          window.location.replace(sameSiteReferrer);
          return;
        }

        if (path === "/seasonal-guide/") {
          window.location.replace("/how-to-give/");
          return;
        }

        window.history.back();
      });

      const footer = document.createElement("footer");
      footer.className = "pp-sub-footer";
      footer.innerHTML = `
        <div class="pp-sub-footer-links">
          <a href="/">Home</a>
          <a href="/privacy/">Privacy Policy</a>
          <a href="/privacy/#affiliate-disclosure">Affiliate Disclosure</a>
        </div>
        <div>716 Little Free Pantry Coalition &bull; Western New York</div>
      `;
      document.body.appendChild(footer);

      const topBtn = document.createElement("a");
      topBtn.className = "pp-sub-top-btn";
      topBtn.href = "#top";
      topBtn.textContent = "↑ Top";
      document.body.appendChild(topBtn);
    })();
