var assert = require('chai').assert;
var expect = require('chai').expect;
const pptr = require('puppeteer');

describe('Dummy', function() {
    it('should always pass', function() {
        assert.equal(true, true);
        expect(true).equal(true);
    });
});

describe('puppeteer setup', function() {
    this.timeout(10000);

    it('should be defined', function() {
        assert.notEqual(pptr, undefined);
    });

    it('should be able to connect to internet', async function() {
        const browser = await pptr.launch({headless: false});
        const page = await browser.newPage();
        await page.goto('https://google.com');
        await browser.close();
    });
});