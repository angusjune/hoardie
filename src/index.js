'use strict';

import App from './App.svelte';

const isBrowserDark = window.matchMedia("(prefers-color-scheme: dark)").matches || chrome.extension.inIncognitoContext;
if (isBrowserDark) { 
	document.body.classList.add('theme--dark');
	chrome.action.setIcon({
		path: {
			16: './icons/filter-light-16.png',
			24: './icons/filter-light-24.png',
			32: './icons/filter-light-32.png',
		}
	});
} else { 
	document.body.classList.add('theme--default');
	chrome.action.setIcon({
		path: {
			16: './icons/filter-16.png',
			24: './icons/filter-24.png',
			32: './icons/filter-32.png',
		}
	});
}

const app = new App({
	target: document.body
});