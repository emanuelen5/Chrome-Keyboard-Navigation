/* jslint esversion: 6 */

console.log("Getting all links:");

let links = document.querySelectorAll("a");
let links_string = "";
links.forEach(function(element, index) {
    links_string += "\n" + index + ": " + element.href;
    element.style.outline = "1px solid red";
});
console.log("Links: " + links_string);
console.log("Total links received: " + links.length);