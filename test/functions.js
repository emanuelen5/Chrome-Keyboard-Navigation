const assert = require('chai').assert;

const fs = require('fs');
// Include the script in the global scope (not using 'module' to be compatible with client-side js)
eval(fs.readFileSync('src/functions.js')+'');
/* global fuzzy_search */

describe('fuzzy search', function() {
    let search_string = "heeej";

    it('should find word', function() {
        let search_result = fuzzy_search("hej", search_string);
        assert.deepEqual([search_string, "h", "", "e", "ee", "j"], search_result);
    });

    it('first index should be total match', function() {
        let search_result = fuzzy_search("hej", search_string);
        let combined_strings = search_result.slice(1).join('');
        assert.equal(search_result[0], combined_strings);
    });

    it('should find first letters of word', function() {
        let search_result = fuzzy_search("he", search_string);
        assert.deepEqual(["he", "h", "", "e"], search_result);
    });

    it('should find letter', function() {
        let search_result = fuzzy_search("h", search_string);
        assert.deepEqual(["h", "h"], search_result);
    });

    it('should not find word', function() {
        let search_result = fuzzy_search("hejs", search_string);
        assert.deepEqual([], search_result);
    });

    it('should not find letter', function() {
        let search_result = fuzzy_search("s", search_string);
        assert.deepEqual([], search_result);
    });
});