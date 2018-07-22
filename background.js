/*jslint browser: true*/
/* global console, chrome */

(function main() {
    'use strict';

    console.log("background.js is running");
    chrome.browserAction.setBadgeText({"text": "Yolo"}, function () {
        console.log("The callback is run!");
    });
    chrome.browserAction.getBadgeText({}, function (result) {
        console.log("The callback is run! Badge text: '" + result + "'");
    });
    chrome.browserAction.setBadgeBackgroundColor({"color": "#E10F0F"}, function () {
        console.log("Changed background color");
    });

    chrome.runtime.onInstalled.addListener(function () {
      chrome.storage.sync.set({color: '#3aa757'}, function() {
        console.log("The color is green.");
      });
    });

    chrome.commands.onCommand.addListener(function (command) {
        console.log("Command is being run: " + command);
    });

    chrome.runtime.onInstalled.addListener(function() {
        chrome.contextMenus.create({
            "id": "sampleContextMenu",
            "title": "Sample Context Menu",
            "contexts": ["selection"]
        });
    });

    console.log("background.js has run");
}());