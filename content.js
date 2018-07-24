/* jslint esversion: 6 */

function modify_element_after_visibility(el) {
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

console.log("Getting all links:");

let links = document.querySelectorAll("a");
let links_string = "";
links.forEach(function(element, index) {
    links_string += "\n" + index + ": " + element.href;
    modify_element_after_visibility(element);
});
console.log("Links: " + links_string);
console.log("Total links received: " + links.length);