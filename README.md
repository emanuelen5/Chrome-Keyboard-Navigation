# Chrome keyboard navigation

## Introduction
I want to make an extension that makes it simpler to navigate websites without a mouse. Links are the largest problem. The only way to properly select links is to tab until you reach link that you want to enter.

## Development

### Test page
The extension is initially only activated on the [test page](https://github.com/emanuelen5/Chrome-Keyboard-Navigation/blob/8df984772a63da6a0492bd3ccfdb04f6b63dd8fe/testpage.html) (like a main program). This is specified in the [manifest](https://github.com/emanuelen5/Chrome-Keyboard-Navigation/blob/8df984772a63da6a0492bd3ccfdb04f6b63dd8fe/manifest.json#L41).

### Getting web page content
Create a [content script](https://developer.chrome.com/extensions/content_scripts) that gets all of the links in the web page. A good step to begin is by looking at the [Alfred Lynx](https://chrome.google.com/webstore/detail/alfred-lynx/opmfnhbnmeaiamegjkackhcemcedemeb) plugin since it implements something very similar to what I want.
