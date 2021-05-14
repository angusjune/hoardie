'use strict';

import App from './App.svelte';

const isBrowserDark = window.matchMedia("(prefers-color-scheme: dark)").matches || chrome.extension.inIncognitoContext;
if (isBrowserDark) { document.body.classList.add('theme--dark'); }

const app = new App({
	target: document.body
});