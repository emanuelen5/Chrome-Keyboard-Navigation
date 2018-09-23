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