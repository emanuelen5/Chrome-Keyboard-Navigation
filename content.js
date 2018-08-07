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

class OverlayList {
    constructor () {
        this.list = [];
    }

    push (copy_element, copied_element) {
        this.list.push(new Overlay(copy_element, copied_element));
    }

    pop () {
        this.list.pop().destroy();
    }
}

var overlay_list = new OverlayList();

function absolute_element_overlay(copy_element, to_element=document.body) {
    let copied_element = copy_element.cloneNode(true);
    copy_element.style.visibility = "hidden"; // TODO: Restore this in undo function

    copied_element.style.position = 'absolute';
    function update_coordinates () {
        // TODO: Use a reference to the original object to find its new position
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

// Make all of the links pop out, but the background dimmed
absolute_element_overlay(document.querySelector("a"), document.body);