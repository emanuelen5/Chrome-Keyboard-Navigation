/* jslint esversion: 6 */

function color_element_from_position(el) {
    var rect = el.getBoundingClientRect();
    // Completely visible
    if ((rect.top >= 0) && (rect.bottom <= window.innerHeight) && (rect.left >= 0) && (rect.right <= window.innerWidth)) {
        el.style.outline = "1px solid green";
    // Partially visible
    } else if (((rect.bottom > 0) && (rect.top < window.innerHeight)) && ((rect.right > 0) && (rect.left < window.innerWidth))) {
        el.style.outline = "1px solid blue";
    // Not at all visible
    } else {
        el.style.outline = "1px solid red";
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