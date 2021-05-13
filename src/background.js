'use strict';

import { uuid } from './utils.js';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    contexts: ['action'],
    title: 'Display Hoardie',
    id: 'openIndex'
  });
  chrome.contextMenus.create({
    contexts: ['action'],
    title: 'Hoard all Tabs',
    id: 'saveTabs'
  });
});

chrome.contextMenus.onClicked.addListener(info => {
  console.log(info);
  const menuId = info.parentMenuItemId;
  if (menuId === 'openIndex') {

  } else if (menuId === 'saveTabs') {
    hoard();
  }
});

chrome.action.onClicked.addListener(async tab => {
  hoard();
});

async function hoard() {
  // get all unpinned tabs in current window
  const tabs = await chrome.tabs.query({ currentWindow: true, pinned: false });

  // get ids of all tabs
  let ids = [];
  let usefulTabs = [];
  tabs.forEach((el, i) => {
      ids.push(el.id);
      // exclude unwanted tabs;
      if (el.url !== 'chrome://newtab/') {
        usefulTabs.push(el);
      }
  });

  // close all tabs
  await chrome.tabs.remove(ids);

  if(usefulTabs.length > 0) {
    // save opened tabs in storage
    await setTabsData(usefulTabs);
  } else { return; }

  chrome.storage.local.get(['indexURL'], async props => {
    const indexURL = props.indexURL;
    const [indexTab] = await chrome.tabs.query({ url: indexURL });

    openIndex(indexTab);
  }); 
}

function openIndex(indexTab) {
  if (indexTab === undefined) {
    // open homepage
    chrome.tabs.create({
      url: 'index.html',
      pinned: true,
    });
  } else {
    chrome.tabs.update(indexTab.id, {
      url: 'index.html',
      pinned: true
    });
  }
}

function setTabsData(newTabInfo) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get({
      tabGroups: []
    }, async props => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      const formerTabGroups = props.tabGroups;

      let newTabs = [];

      // add uuid to all tabs
      newTabInfo.forEach((tabInfo, i) => {
          const tab = {
            id: uuid(),
            pinned: false,
            tabInfo: tabInfo
          };
          newTabs.push(tab);
      });

      const newTabGroup = {
        id: uuid(),
        tabs: newTabs,
        pinned: false,
        createdTime: Date.now(),
      };

      const allTabGroups = [newTabGroup].concat(formerTabGroups);

      chrome.storage.local.set({ tabGroups: allTabGroups }, () => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve();
      });
    });
  });
}