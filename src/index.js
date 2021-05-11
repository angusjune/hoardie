'use strict';

// import './index.scss';
// import { formatDistanceToNowStrict } from 'date-fns';
// import { zhCN } from 'date-fns/locale';
// import './tabListComponent';

// const url = chrome.runtime.getURL('index.html');
// chrome.storage.local.set({indexURL: url });

// chrome.storage.local.get(['tabs'], props => {
//     console.log(props);
//     const tabs = props.tabs;
//     const list = document.querySelector('#list');

//     tabs.forEach((el, i) => {
//         if (el.url === url) {
//             return;
//         }
//         const item = createTabList(el, tabs);
//         list.append(item);
//     });
// });

// const createTabList = (tab, tabs) => {
//     const tabId = tab.id;
//     const tabListIcon  = tab.favIconUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTkgMS41QzQuODYgMS41IDEuNSA0Ljg2IDEuNSA5QzEuNSAxMy4xNCA0Ljg2IDE2LjUgOSAxNi41QzEzLjE0IDE2LjUgMTYuNSAxMy4xNCAxNi41IDlDMTYuNSA0Ljg2IDEzLjE0IDEuNSA5IDEuNVpNOC4yNSAxNC45NDc1QzUuMjg3NSAxNC41OCAzIDEyLjA2IDMgOUMzIDguNTM1IDMuMDYgOC4wOTI1IDMuMTU3NSA3LjY1NzVMNi43NSAxMS4yNVYxMkM2Ljc1IDEyLjgyNSA3LjQyNSAxMy41IDguMjUgMTMuNVYxNC45NDc1Wk0xMy40MjUgMTMuMDQyNUMxMy4yMyAxMi40MzUgMTIuNjc1IDEyIDEyIDEySDExLjI1VjkuNzVDMTEuMjUgOS4zMzc1IDEwLjkxMjUgOSAxMC41IDlINlY3LjVINy41QzcuOTEyNSA3LjUgOC4yNSA3LjE2MjUgOC4yNSA2Ljc1VjUuMjVIOS43NUMxMC41NzUgNS4yNSAxMS4yNSA0LjU3NSAxMS4yNSAzLjc1VjMuNDQyNUMxMy40NDc1IDQuMzM1IDE1IDYuNDg3NSAxNSA5QzE1IDEwLjU2IDE0LjQgMTEuOTc3NSAxMy40MjUgMTMuMDQyNVoiIGZpbGw9IiNDNEM0QzQiLz4KPC9zdmc+Cg==';
//     const tabListTitle = tab.title;

//     // create tablist element
//     const tabList = document.createElement('tab-list');

//     // adding tablist attributes
//     tabList.setAttribute('id', tabId);
//     tabList.setAttribute('iconurl', tabListIcon);
//     tabList.textContent = tabListTitle;
//     tabList.tabIndex = 0;

//     function handleClick(e) {
//         chrome.tabs.create({
//             url: tab.url,
//             pinned: tab.pinned,
//             index: 1,
//             active: false,
//         }, async tab => {
//             let remainingTabs = tabs;
//             const removedTab = remainingTabs.filter(el => el.id + "" == tabList.id);
//             console.log(removedTab);
//             // remove reopened tab from the list
//             remainingTabs.splice(remainingTabs.indexOf(removedTab), 1);

//             console.log(remainingTabs);
//             await chrome.storage.local.set({ tabs: remainingTabs });

//             e.target.remove();
//         });
//     }

//     // clicking the list
//     tabList.addEventListener('click', handleClick);
//     // hiting Enter works too
//     tabList.addEventListener('keyup', e => {
//         if (e.key === 'Enter') {
//             handleClick(e);
//         }
//     });

//     return tabList;
// };

// document.querySelector('#btnClearAll').addEventListener('click', e => {
//     e.preventDefault();
//     chrome.storage.local.set({ tabs: [] });
// });

// const humanReadableDate = comparisonDate => {
//     const lang = chrome.i18n.getUILanguage();
//     let result;
//     if (lang === 'zh-CN') {
//         result = formatDistanceToNowStrict(comparisonDate, { locale: zhCN});
//     } else {
//         result = formatDistanceToNowStrict(comparisonDate);
//     }
//     return result;
// };

import App from './App.svelte';

const app = new App({
	target: document.body
});