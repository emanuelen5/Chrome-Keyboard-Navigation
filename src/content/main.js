/* global chrome */

class Overlay {
    constructor (element) {
        this.element = element;
        this.on_destruction = [];
    }

    destroy () {
        for (const fn_h of this.on_destruction)
            fn_h(this);
    }

    register_on_destruction (fn_h) {
        this.on_destruction.push(fn_h);
    }
}

var overlay_list = new (class OverlayList {
    constructor () {
        this.link_counter = 0;
        this.list = [];
    }

    isEmpty () {
        return (this.list.length === 0);
    }

    push (copy_element) {
        copy_element.setAttribute("kn__link_index", this.link_counter);
        this.link_counter++;
        const overlay = new Overlay(copy_element);
        this.list.push(overlay);
        return overlay;
    }

    clear () {
        this.link_counter = 0;
        for (let i = this.list.length - 1; i >= 0; i--) {
            this.destroy_index(i);
        }
    }

    destroy_index (index) {
        if (index < 0 || index >= this.list.length)
            return;
        let overlay = this.list[index];
        this.list.splice(index, 1);
        overlay.element.removeAttribute("kn__link_index");
        overlay.destroy();
    }

    destroy_node (node) {
        if (!this.has_node(node))
            return;
        for (var index = 0; index < this.list.length; index++) {
            if (this.list[index].element.getAttribute("kn__link_index") === node.getAttribute("kn__link_index")) {
                this.destroy_index(index);
            }
        }
    }

    has_node (node) {
        return node.hasAttribute("kn__link_index");
    }

    redraw () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0,0,canvas.width,canvas.height);
        for (const overlay of this.list) {
            const rect = overlay.element.getBoundingClientRect();
            let left = rect.left;
            let top = rect.top;
            let width = rect.width || overlay.element.offsetWidth;
            let height = rect.height || overlay.element.offsetHeight;
            ctx.clearRect(left, top, width, height);
        }
    }
})();

function strip_attribute(element, attribute="id", clone=true) {
    let return_element;
    if (clone) {
        return_element = element.cloneNode(true);
    } else {
        return_element = element;
    }
    return_element.removeAttribute(attribute);
    return_element.querySelectorAll("[" + attribute + "]").forEach(el => {el.removeAttribute(attribute);});
    return return_element;
}

let canvas, ctx;
let update_overlay_size_fn;

function redraw_overlay() {
    overlay_list.redraw();
}

let search_bar = new (
    class SearchBar {
        constructor() {
            this.is_attached = false;
            canvas = document.createElement("canvas");
            ctx = canvas.getContext("2d");
            this.overlay = document.createElement("kn__overlay");
            this.overlay.appendChild(canvas);
            update_overlay_size_fn = (function (overlay) {
                let fn = function update_overlay_size() {
                    const width = window.innerWidth;
                    const height = window.innerHeight;
                    canvas.width = width;
                    canvas.height = height;
                    overlay.style.width = width + "px";
                    overlay.style.height = height + "px";
                    ctx.fillStyle = "#FFF";
                    ctx.clearRect(0,0,width,height);
                    ctx.fillRect(0,0,width,height);
                };
                fn();
                return fn;
            })(this.overlay);

            let search_box = document.createElement("kn__search_box");

            let input = document.createElement("input");
            input.addEventListener("input", function on_search_bar_input () {
                let search_text = this.value;
                search_text = search_text.replace(/ /g, "");
                search_bar.filter_links(search_text);
            });
            this.input = input;
            search_box.appendChild(this.input);
            this.search_box = search_box;
            document.body.appendChild(this.overlay);
            document.body.appendChild(this.search_box);
        }

        attach() {
            if (!this.is_attached) {
                window.addEventListener("resize", update_overlay_size_fn);
                update_overlay_size_fn(); // Make sure it's the correct size on startup
                window.addEventListener("resize", redraw_overlay);
                window.addEventListener("scroll", redraw_overlay);
                redraw_overlay();
                this.is_attached = true;
                this.overlay.classList.add("activated");
                this.search_box.classList.add("activated");
                this.input.value = "";
                this.old_focus = document.activeElement.hasFocus && document.activeElement || document.querySelector("*:focus");
                this.input.focus();
            }
        }

        detach() {
            if (this.is_attached) {
                window.removeEventListener("resize", update_overlay_size_fn);
                window.removeEventListener("resize", redraw_overlay);
                window.removeEventListener("scroll", redraw_overlay);
                this.is_attached = false;
                this.overlay.classList.remove("activated");
                this.search_box.classList.remove("activated");
                this.input.value = "";
                if (this.old_focus)
                    this.old_focus.focus();
            }
        }

        filter_links(search_text) {
            for (let link of document.querySelectorAll("a:not(.kn__copy_element)")) {
                if (early_exit_fuzzy_match(search_text, link.textContent)) {
                    const rect = link.getBoundingClientRect();
                    if (rect.width === 0)
                        continue;
                    overlay_list.push(link);
                } else {
                    overlay_list.destroy_node(link);
                }
            }
            overlay_list.redraw();
        }
    }
)();

class AppState {
    constructor(name) {
        this.name = name;
    }
}

// Create unique states
let APP_STATE_IDLE = new AppState("IDLE");
let APP_STATE_FILTER = new AppState("FILTER");
let app_state = APP_STATE_IDLE;

document.addEventListener("keydown", function app_state_change(event) {
    if (app_state === APP_STATE_IDLE) {
        // Go to search state
        if (event.key === "f" && event.ctrlKey && event.altKey) {
            app_state = APP_STATE_FILTER;
            search_bar.attach();
            overlay_list.clear();
            console.log("Going to filter state");
        }
    } else if (app_state === APP_STATE_FILTER) {
        // Escape key
        if (event.key === "Escape") {
            app_state = APP_STATE_IDLE;
            search_bar.detach();
            overlay_list.clear();
            overlay_list.redraw();
            console.log("Going to idle state");
        }
    }
});

function test() {
    console.log("fuzzy_search(\"has\", \"helas\"):");
    console.log(fuzzy_search("has", "helas"));
    
    // Demo mode, animate some
    setTimeout(function () {
        overlay_list.push(document.getElementById("first_link"));
        setTimeout(function () {
            overlay_list.clear();
        }, 1000);
    }, 1000);
}

// test();