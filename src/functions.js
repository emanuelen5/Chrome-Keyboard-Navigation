/**
 * Escapes a Regex (https://stackoverflow.com/a/3561711/4713758)
 * @param  {string} s String to escape as literal regex
 * @return {string}   Escaped string
 */
RegExp.escape= function(s) {
    return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
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
    let res = needle_re.exec(haystack);
    if (res === null) {
        return [];
    } else {
        return res;
    }
}