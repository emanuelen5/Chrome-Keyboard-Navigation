const assert = require('chai').assert;

const fs = require('fs');
// Include the script in the global scope (not using 'module' to be compatible with client-side js)
eval(fs.readFileSync('src/functions.js')+'');
/* global fuzzy_search, get_fuzzy_search_string, to_escaped_char_array, early_exit_fuzzy_match */

describe('fuzzy_search', function() {
    let search_string;
    beforeEach(function() {
        search_string = "heeej"
    });

    it('should find word', function() {
        let search_result = fuzzy_search("hej", search_string);
        assert.deepEqual(
            search_result,
            [search_string, "h", "", "e", "ee", "j"]
        );
    });

    it('first index should be total match', function() {
        let search_result = fuzzy_search("hej", search_string);
        let combined_strings = search_result.slice(1).join('');
        assert.equal(
            combined_strings,
            search_result[0]
        );
    });

    it('should find first letters of word', function() {
        let search_result = fuzzy_search("he", search_string);
        assert.deepEqual(
            search_result,
            ["he", "h", "", "e"]
        );
    });

    it('should find letter', function() {
        let search_result = fuzzy_search("h", search_string);
        assert.deepEqual(
            search_result,
            ["h", "h"]
        );
    });

    it('should not find word', function() {
        let search_result = fuzzy_search("hejs", search_string);
        assert.deepEqual(
            search_result,
            null
        );
    });

    it('should not find letter', function() {
        let search_result = fuzzy_search("s", search_string);
        assert.deepEqual(
            search_result,
            null
        );
    });

    it('should match escaped strings', function() {
        search_string = "\\can match as well\\";
        let search_result = fuzzy_search("\\\\", search_string);
        assert.deepEqual(
            search_result,
            [search_string, '\\', 'can match as well', '\\']
        );
    });
});

describe('early_exit_fuzzy_match', function() {
    let search_string;
    beforeEach(function() {
        search_string = "heeej"
    });

    it('should find word', function() {
        let match = early_exit_fuzzy_match("hej", search_string);
        assert.isTrue(match);
    });

    it('should find first letters of word', function() {
        let match = early_exit_fuzzy_match("he", search_string);
        assert.isTrue(match);
    });

    it('should find letter', function() {
        let match = early_exit_fuzzy_match("h", search_string);
        assert.isTrue(match);
    });

    it('should not find word', function() {
        let match = early_exit_fuzzy_match("hejs", search_string);
        assert.isFalse(match);
    });

    it('should not find letter', function() {
        let match = early_exit_fuzzy_match("s", search_string);
        assert.isFalse(match);
    });

    it('should match escaped strings', function() {
        search_string = "\\can match as well\\";
        let match = early_exit_fuzzy_match("\\\\", search_string);
        assert.isTrue(match);
    });
});

describe('get_fuzzy_search_string', function() {
    it('should group letter', function() {
        let search_string = "a";
        let fuzzy_search_string = get_fuzzy_search_string(search_string);
        assert.equal(
            fuzzy_search_string,
            "(a)"
        );
    });

    it('should group between letters', function() {
        let search_string = "aa";
        let fuzzy_search_string = get_fuzzy_search_string(search_string);
        assert.equal(
            fuzzy_search_string,
            "(a)(.*?)(a)"
        );
    });

    it('should escape escapee as one group', function() {
        let fuzzy_search_string = get_fuzzy_search_string("\\");
        assert.equal(
            fuzzy_search_string,
            "(\\\\)"
        );
    });
});

describe('to_escaped_char_array', function() {
    it('is a precondition for string.split("") to produce one character for each backslash', function() {
        const string = "\\";
        assert.equal(string.split("").length, string.length);
    });

    it('should not split escaped backslashes', function() {
        const escaped_char_array = to_escaped_char_array('\\');
        assert.deepEqual(escaped_char_array, ["\\\\"]);
    });

    it('should escape special characters', function() {
        const escaped_char_array = to_escaped_char_array('(.*?');
        assert.deepEqual(escaped_char_array, ["\\(", "\\.", "\\*", "\\?"]);
    });

    it('should split regular characters into array', function() {
        const string = 'abcdefghijklmnopqrstuvxyz';
        const escaped_char_array = to_escaped_char_array(string);
        assert.deepEqual(escaped_char_array, string.split(""));
    });
});