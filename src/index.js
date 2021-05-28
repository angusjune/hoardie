'use strict';

import App from './App.svelte';

const isBrowserDark = window.matchMedia("(prefers-color-scheme: dark)").matches || chrome.extension.inIncognitoContext;
if (isBrowserDark) { 
	document.body.classList.add('theme--dark');
	chrome.action.setIcon({
		path: {
			16: 'icons/box-light-16.png',
			24: 'icons/box-light-24.png',
			32: 'icons/box-light-32.png',
		}
	});
} else { 
	document.body.classList.add('theme--default');
	chrome.action.setIcon({
		path: {
			16: 'icons/box-16.png',
			24: 'icons/box-24.png',
			32: 'icons/box-32.png',
		}
	});
}

const app = new App({
	target: document.body
});