# Development plan for *Keyboard navigation* Chrome extension

## Introduction
I want to make an extension that makes it simpler to navigate websites without a mouse. Links is the largest problem. The only way to properly select links is to tab until you reach link that you want to enter.

## Development

### Getting web page content
Create a [content script](https://developer.chrome.com/extensions/content_scripts) that gets all of the links in the web page. A good step to begin is by looking at the [Alfred Lynx](https://chrome.google.com/webstore/detail/alfred-lynx/opmfnhbnmeaiamegjkackhcemcedemeb) plugin since it implements something very similar to what I want.