/* jslint esversion: 6 */

function color_element_from_position(el) {
    var rect = el.getBoundingClientRect();
    let classes = el.classList;
    ["kn__in_frame", "kn__outside_frame", "kn__partially_in_frame"].forEach(function(className) {
        classes.remove(className);
    });
    // Completely visible
    if ((rect.top >= 0) && (rect.bottom <= window.innerHeight) && (rect.left >= 0) && (rect.right <= window.innerWidth)) {
       classes.add("kn__in_frame");
    // Partially visible
    } else if (((rect.bottom > 0) && (rect.top < window.innerHeight)) && ((rect.right > 0) && (rect.left < window.innerWidth))) {
       classes.add("kn__partially_in_frame");
    // Partially visible
    // Not at all visible
    } else {
       classes.add("kn__outside_frame");
    // Partially visible
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
    if (event.key === "e" && event.ctrlKey && event.altKey) {
        color_links_with_timing();
    }
});

class Overlay {
    constructor (copy_element, copied_element) {
        this.copy_element = copy_element;
        this.copied_element = copied_element;
    }

    destroy () {
        this.copied_element.parentNode.removeChild(this.copied_element);
        this.copy_element.style.visibility = "visible";
    }
}

var overlay_list = new (class OverlayList {
    constructor () {
        this.list = [];
        this.overlay = document.createElement("kn__overlay");
        // document.body.appendChild(this.overlay);
    }

    isEmpty () {
        return (this.list.length === 0);
    }

    push (copy_element, copied_element) {
        let wasEmpty = this.isEmpty();
        this.list.push(new Overlay(copy_element, copied_element));
        // Not being empty any more
        if (wasEmpty) {
            this.overlay.classList.add("activated");
        }
    }

    clear () {
        this.overlay.classList.remove("activated");
        let clear_elements = this.list;
        this.list = [];
        // Remove all elements after animation is done
        setTimeout(
            (
                function (clear_elements_internal) {
                    return function () {
                        for (let i in clear_elements_internal) {
                            clear_elements_internal[i].destroy();
                        }
                    };
                }
            )(clear_elements), 500);
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

function absolute_element_overlay(copy_element, to_element=document.body) {
    let copied_element = strip_attribute(copy_element);
    copy_element.style.visibility = "hidden";

    copied_element.style.position = 'absolute';
    function update_coordinates () {
        let rect = copy_element.getBoundingClientRect();
        copied_element.style.left = rect.left + 'px';
        copied_element.style.top = rect.top + 'px';
        copied_element.style.width = (rect.width || copied_element.offsetWidth) + 'px';
    }

    overlay_list.push(copy_element, copied_element);

    window.addEventListener("resize", function () {
      update_coordinates();
    });
    update_coordinates();

    to_element.appendChild(copied_element);
}

// From https://stackoverflow.com/a/3561711/4713758
RegExp.escape= function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

/**
 * Perform a fuzzy search for a literal string.
 * @param  {str} needle   Literal string to search for
 * @param  {str} haystack String to search in
 * @return {array}        Array of search results. Odd indices are the literal characters in the input. Even indices are the letters between them. Index 0 is the full match.
 */
function fuzzy_search(needle, haystack) {
    let needle_re = RegExp.escape(needle);
    // Insert wildcard between every character
    needle_re = needle_re.split("").join(")(.*?)(");
    needle_re = "(" + needle_re + ")";
    needle_re = RegExp(needle_re, "gi");
    return needle_re.exec(haystack);
}

function filter_links(search_text) {
    for (let link of document.querySelectorAll("a")) {
        if (fuzzy_search(search_text, link.innerText) !== null) {
            absolute_element_overlay(link, document.body);
        }
    }
}

let search_bar = new (
    class SearchBar {
        constructor() {
            this.is_attached = false;
            this.overlay = document.createElement("kn__overlay");
            let search_box = document.createElement("kn__search_box");

            let input = document.createElement("input");
            input.addEventListener("input", function () {
                let search_text = this.value;
                overlay_list.clear();
                if (search_text.replace(/ /g, "") !== "") {
                    filter_links(search_text);
                }
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
            }
        }

        detach() {
            if (this.is_attached) {
                this.is_attached = false;
                this.overlay.classList.remove("activated");
                this.search_box.classList.remove("activated");
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
            console.log("Going to filter state");
        }
    } else if (app_state === APP_STATE_FILTER) {
        // Escape key
        if (event.key === "Escape") {
            app_state = APP_STATE_IDLE;
            search_bar.detach();
            overlay_list.clear();
            search_bar.input.value = "";
            console.log("Going to idle state");
        }
    }
});

function test() {
    console.log("fuzzy_search(\"has\", \"helas\"):");
    console.log(fuzzy_search("has", "helas"));
    
    // Demo mode, animate some
    setTimeout(function () {
        absolute_element_overlay(document.getElementById("first_link"), document.body);
        setTimeout(function () {
            overlay_list.clear();
        }, 1000);
    }, 1000);
}

// test();