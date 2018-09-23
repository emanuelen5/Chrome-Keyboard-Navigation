/**
 * Escapes a Regex (https://stackoverflow.com/a/3561711/4713758)
 * @param  {string} s String to escape as literal regex
 * @return {string}   Escaped string
 */
RegExp.escape= function(s) {
    return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
};

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

function to_escaped_char_array(string) {
    let escaped_char_array = string.split("");
    let last_was_backslash = false;
    for (var i = escaped_char_array.length-1; i >= 0; i--) {
        if (last_was_backslash) {
            escaped_char_array.remove(i);
            last_was_backslash = false;
            continue;
        } else if (escaped_char_array[i] === "\\") {
            escaped_char_array[i] = RegExp.escape(escaped_char_array[i]);
            last_was_backslash = true;
        } else {
            escaped_char_array[i] = RegExp.escape(escaped_char_array[i]);
        }
    }
    return escaped_char_array;
}

function get_fuzzy_search_string(needle) {
    let needle_re = RegExp.escape(needle);
    // Insert wildcard between every character
    let escaped_char_array = to_escaped_char_array(needle_re);
    needle_re = escaped_char_array.join(")(.*?)(");
    needle_re = "(" + needle_re + ")";
    return needle_re;
}

/**
 * Perform a fuzzy search for a literal string.
 * @param  {str} needle   Literal string to search for
 * @param  {str} haystack String to search in
 * @return {array}        Array of search results. Odd indices are the literal characters in the input. Even indices are the letters between them. Index 0 is the full match.
 */
function fuzzy_search(needle, haystack) {
    let needle_re = get_fuzzy_search_string(needle);
    needle_re = RegExp(needle_re, "gi");
    let res = needle_re.exec(haystack);
    if (res === null) {
        return [];
    } else {
        return res;
    }
}