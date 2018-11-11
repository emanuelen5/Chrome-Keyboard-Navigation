/* global chrome */

const VISIBLE = 0;
const PARTIALLY_VISIBLE = 1;
const OUTSIDE_FRAME = 2;

function classify_position(el) {
    var rect = el.getBoundingClientRect();
    // Completely visible
    if ((rect.top >= 0) && (rect.bottom <= window.innerHeight) && (rect.left >= 0) && (rect.right <= window.innerWidth)) {
        return VISIBLE;
    // Partially visible
    } else if (((rect.bottom > 0) && (rect.top < window.innerHeight)) && ((rect.right > 0) && (rect.left < window.innerWidth))) {
        return PARTIALLY_VISIBLE;
    // Not at all visible
    } else {
        return OUTSIDE_FRAME;
    }
}

function color_element_from_position(el) {
    let classes = el.classList;
    ["kn__in_frame", "kn__outside_frame", "kn__partially_in_frame"].forEach(function(className) {
        classes.remove(className);
    });
    let pos_classification = classify_position(el);
    switch (pos_classification) {
    case VISIBLE:
        classes.add("kn__in_frame");
        break;
    case PARTIALLY_VISIBLE:
        classes.add("kn__partially_in_frame");
        break;
    case OUTSIDE_FRAME:
        classes.add("kn__outside_frame");
        break;
    }
}

function color_links() {
    console.log("Getting all links:");
    let links = document.querySelectorAll("a");
    let links_string = "";
    links.forEach(function(element, index) {
        links_string += "\n" + index + ": " + element.href;
        color_element_from_position(element);
    });
    console.log("Links: " + links_string);
    console.log("Total links received: " + links.length);
    chrome.runtime.sendMessage({link_count: links.length});
    console.log("Sent link count");
}

function timed_decorator(fn) {
    function timed_call() {
        let start = new Date().getTime();
        fn(arguments);
        let end = new Date().getTime();
        console.log("Total runtime: " + (end - start).toFixed(5));
    }
    return timed_call;
}

let color_links_with_timing = timed_decorator(color_links);
document.addEventListener("keydown", function make_links_visible(event) {
    if (event.key === "g" && event.ctrlKey && event.altKey) {
        color_links_with_timing();
    }
});

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
        let el = this.list[index];
        this.list.splice(index, 1);
        el.element.removeAttribute("kn__link_index");
        el.destroy();
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
function absolute_element_overlay(copy_element) {
    const rect = copy_element.getBoundingClientRect();
    if (rect.width === 0)
        return;

    function update_coordinates () {
        const rect = copy_element.getBoundingClientRect();
        let left = window.scrollX + rect.left;
        let top = window.scrollY + rect.top;
        let width = (rect.width || copy_element.offsetWidth);
        let height = (rect.height || copy_element.offsetHeight);
        ctx.clearRect(left, top, width, height);
    }
    update_coordinates();

    window.addEventListener("resize", update_coordinates);
    window.addEventListener("scroll", update_coordinates);

    const overlay = overlay_list.push(copy_element);
    overlay.register_on_destruction((
        (fn) => { return () => {
            window.removeEventListener("scroll", fn);
            window.removeEventListener("resize", fn);
        }; }
    )(update_coordinates));
}

let search_bar = new (
    class SearchBar {
        constructor() {
            this.is_attached = false;
            canvas = document.createElement("canvas");
            canvas.style.width  = "100%";
            canvas.style.height = "100%";
            canvas.style.pointerEvents = "none";
            canvas.style.position = "absolute";
            canvas.style.zIndex = 16000;
            canvas.style.top = 0;
            canvas.style.left = 0;
            ctx = canvas.getContext("2d");
            this.overlay = canvas;

            window.addEventListener("resize", 
                (function (overlay) {
                    let fn = function update_overlay_size() {
                        canvas.width = document.body.offsetWidth;
                        canvas.height = document.body.offsetHeight;
                        overlay.style.width = document.body.offsetWidth + "px";
                        overlay.style.height = document.body.offsetHeight + "px";
                        ctx.fillStyle = "rgba(255,0,0,0.9)";
                        ctx.fillRect(0,0,canvas.width,canvas.height);
                    };
                    fn();
                    return fn;
                })(this.overlay));

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
                if (overlay_list.has_node(link) && fuzzy_search(search_text, link.textContent) === null) {
                    overlay_list.destroy_node(link);
                } else if (!overlay_list.has_node(link) && fuzzy_search(search_text, link.textContent) !== null) {
                    absolute_element_overlay(link);
                }
            }
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
            console.log("Going to idle state");
        }
    }
});

function test() {
    console.log("fuzzy_search(\"has\", \"helas\"):");
    console.log(fuzzy_search("has", "helas"));
    
    // Demo mode, animate some
    setTimeout(function () {
        absolute_element_overlay(document.getElementById("first_link"));
        setTimeout(function () {
            overlay_list.clear();
        }, 1000);
    }, 1000);
}

// test();