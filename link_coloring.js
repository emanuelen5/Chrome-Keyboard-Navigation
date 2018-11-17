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