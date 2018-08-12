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
        document.body.appendChild(this.overlay);
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
        setTimeout(function () {
            for (let i in clear_elements) {
                clear_elements[i].destroy();
            }
        }, 500);
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

// Demo mode, animate some
setTimeout(function () {
    absolute_element_overlay(document.getElementById("first_link"), document.body);
    setTimeout(function () {
        overlay_list.clear();
    }, 1000);
}, 1000);