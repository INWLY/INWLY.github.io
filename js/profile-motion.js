(function () {
    "use strict";

    var root = document.querySelector("[data-profile-motion]");
    if (!root) return;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var noMotion = reduceMotion || /(?:\?|&)noanim\b/.test(window.location.search);
    var status = root.querySelector(".profile-copy-status");
    var lenis = null;

    function copyText(value) {
        if (!value) return Promise.reject(new Error("No value to copy"));
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(value);
        }

        return new Promise(function (resolve, reject) {
            var area = document.createElement("textarea");
            area.value = value;
            area.setAttribute("readonly", "");
            area.style.position = "fixed";
            area.style.left = "-9999px";
            document.body.appendChild(area);
            area.select();
            try {
                document.execCommand("copy");
                resolve();
            } catch (error) {
                reject(error);
            } finally {
                document.body.removeChild(area);
            }
        });
    }

    function markCopied(target, label) {
        target.classList.add("is-copied");
        var actionLabel = target.querySelector("em");
        var original = actionLabel ? actionLabel.textContent : "";
        if (actionLabel) actionLabel.textContent = "Copied";
        if (status) status.textContent = label + " copied";

        window.setTimeout(function () {
            target.classList.remove("is-copied");
            if (actionLabel) actionLabel.textContent = original || "Copy";
            if (status) status.textContent = "";
        }, 1500);
    }

    function setupCopy() {
        root.querySelectorAll(".copy-contact").forEach(function (button) {
            button.addEventListener("click", function () {
                var value = button.getAttribute("data-copy");
                var labelNode = button.querySelector(".contact-label");
                var label = labelNode ? labelNode.textContent : button.textContent.replace(/^Copy\s+/i, "");
                label = label.charAt(0).toUpperCase() + label.slice(1);
                copyText(value).then(function () {
                    markCopied(button, label);
                }).catch(function () {
                    if (status) status.textContent = "Copy failed";
                });
            });
        });
    }

    function setupLenis() {
        if (noMotion || typeof window.Lenis !== "function") return;
        lenis = new window.Lenis({
            duration: 0.74,
            easing: function (t) {
                return 1 - Math.pow(1 - t, 3);
            },
            smoothWheel: true,
            smoothTouch: false,
            wheelMultiplier: 0.92
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }

    function setupNav() {
        var links = Array.prototype.slice.call(root.querySelectorAll(".profile-nav a[href^='#']"));
        var sections = links.map(function (link) {
            return document.querySelector(link.getAttribute("href"));
        });

        function setActive(index) {
            links.forEach(function (link, linkIndex) {
                link.classList.toggle("is-active", linkIndex === index);
            });
        }

        function updateActiveFromScroll() {
            var index = 0;
            var nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
            if (nearBottom) {
                setActive(links.length - 1);
                return;
            }
            sections.forEach(function (section, sectionIndex) {
                if (!section) return;
                if (section.getBoundingClientRect().top <= window.innerHeight * 0.42) {
                    index = sectionIndex;
                }
            });
            setActive(index);
        }

        links.forEach(function (link) {
            link.addEventListener("click", function (event) {
                var target = document.querySelector(link.getAttribute("href"));
                if (!target) return;
                event.preventDefault();
                if (lenis) {
                    lenis.scrollTo(target, { offset: -84 });
                } else {
                    target.scrollIntoView({ behavior: noMotion ? "auto" : "smooth", block: "start" });
                }
                setActive(links.indexOf(link));
            });
        });

        window.addEventListener("scroll", updateActiveFromScroll, { passive: true });
        window.addEventListener("resize", updateActiveFromScroll);

        if (!("IntersectionObserver" in window)) return;
        var navObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var index = sections.indexOf(entry.target);
                setActive(index);
            });
        }, {
            rootMargin: "-30% 0px -58% 0px",
            threshold: 0
        });

        sections.forEach(function (section) {
            if (section) navObserver.observe(section);
        });
        updateActiveFromScroll();
    }

    function splitLines(element) {
        if (!element.dataset.lineText) {
            element.dataset.lineText = (element.textContent || "").replace(/\s+/g, " ").trim();
        }
        var text = element.dataset.lineText;
        if (!text) return;

        element.textContent = "";
        var words = text.split(" ");
        var spans = words.map(function (word, index) {
            var span = document.createElement("span");
            span.style.display = "inline-block";
            span.textContent = word;
            element.appendChild(span);
            if (index < words.length - 1) {
                element.appendChild(document.createTextNode(" "));
            }
            return span;
        });

        var lines = [];
        spans.forEach(function (span) {
            var top = Math.round(span.offsetTop);
            var line = lines.find(function (item) {
                return Math.abs(item.top - top) < 3;
            });
            if (!line) {
                line = { top: top, words: [] };
                lines.push(line);
            }
            line.words.push(span.textContent);
        });

        element.textContent = "";
        lines.forEach(function (line, index) {
            var lineSpan = document.createElement("span");
            lineSpan.className = "split-line";
            lineSpan.style.transitionDelay = Math.min(index * 38, 190) + "ms";
            lineSpan.textContent = line.words.join(" ");
            element.appendChild(lineSpan);
        });
    }

    function setupLineReveal() {
        var lineBlocks = Array.prototype.slice.call(root.querySelectorAll(".line-reveal"));
        lineBlocks.forEach(splitLines);

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function () {
                lineBlocks.forEach(splitLines);
                revealInitial();
            });
        }

        var resizeTimer = null;
        window.addEventListener("resize", function () {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(function () {
                lineBlocks.forEach(splitLines);
                revealInitial();
            }, 160);
        });
    }

    function revealInitial() {
        root.querySelectorAll(".reveal-item, .line-reveal").forEach(function (element, index) {
            if (element.getBoundingClientRect().top < window.innerHeight * 0.9) {
                element.style.transitionDelay = Math.min(index * 34, 220) + "ms";
                element.classList.add("is-revealed");
            }
        });
    }

    function setupReveal() {
        var items = Array.prototype.slice.call(root.querySelectorAll(".reveal-item, .line-reveal"));
        if (noMotion || !("IntersectionObserver" in window)) {
            items.forEach(function (item) {
                item.classList.add("is-revealed");
            });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var element = entry.target;
                if (entry.isIntersecting) {
                    element.classList.add("is-revealed");
                    observer.unobserve(element);
                }
            });
        }, {
            rootMargin: "0px 0px -8% 0px",
            threshold: 0.1
        });

        items.forEach(function (item, index) {
            item.style.transitionDelay = Math.min(index * 22, 160) + "ms";
            observer.observe(item);
        });

        revealInitial();
    }

    setupCopy();
    setupLenis();
    setupNav();
    setupLineReveal();
    setupReveal();
})();
