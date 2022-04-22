'use strict';

import Options from './Options.svelte';

const isBrowserDark = window.matchMedia("(prefers-color-scheme: dark)").matches || chrome.extension.inIncognitoContext;
if (isBrowserDark) { 
	document.body.classList.add('theme--dark');
} else { 
	document.body.classList.add('theme--default');
}

const app = new Options({
	target: document.body
});