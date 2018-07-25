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

function timed_function_call(fn) {
    fn_args = [];
    for (var i = 1; i < arguments.length; i++) {
        fn_args.push(arguments[i]);
    }
    let start = new Date().getTime();
    fn(fn_args);
    let end = new Date().getTime();
    console.log("Total runtime: " + (end - start).toFixed(5));
}

document.addEventListener("keydown", function make_links_visible(event) {
    if (event.key === "e" && event.ctrlKey && event.altKey) {
        timed_function_call(color_links);
    }
});