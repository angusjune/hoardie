'use strict';

import { createTabGroup, createTab } from './data.js';

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
  const menuId = info.menuItemId;
  if (menuId === 'openIndex') {
    openIndex(true);
  } else if (menuId === 'saveTabs') {
    hoard();
  }
});

chrome.action.onClicked.addListener(async tab => {
  await hoard();
});

async function hoard() {
  // get all unpinned tabs in current window
  const tabs = await chrome.tabs.query({ currentWindow: true, pinned: false });
    
    // get ids of all tabs
    let ids = [];
    let usefulTabs = [];
    tabs.forEach((el, i) => {
        ids.push(el.id);
        // exclude empty tabs;
        if (el.url !== 'chrome://newtab/') {
          usefulTabs.push(el);
        }
    });

    if(usefulTabs.length > 0) {
      // save opened tabs in storage
      await setTabsData(usefulTabs);
    }

    // open hoardie
    await openIndex();
    // close all tabs
    chrome.tabs.remove(ids);

}

function openIndex(active = false) {
  return new Promise((resolve, reject) =>{
    chrome.storage.local.get(['indexURL'], async props => {
      const indexURL = props.indexURL;
      const [indexTab] = await chrome.tabs.query({ url: indexURL });
  
      if (indexTab === undefined) {
        // open homepage
        chrome.tabs.create({
          url: 'index.html',
          pinned: true,
          active: active,
        }, () => {
          resolve();
        });
      } else {
        if (active) {
          chrome.tabs.update(indexTab.id, {
            active: active,
          }, () => { resolve(); });
        } else { resolve(); }
      }
    });
  });
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
          const tab = createTab(tabInfo);
          newTabs.push(tab);
      });

      const newTabGroup = createTabGroup(newTabs);
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