'use strict';

import { uuid } from './utils.js';

chrome.action.onClicked.addListener(async tab => {
  // get all unpinned tabs in current window
  const tabs = await chrome.tabs.query({ currentWindow: true, pinned: false });

  // get ids of all tabs
  let ids = [];
  tabs.forEach((el, i) => {
      ids.push(el.id);
  });

  // save opened tabs in storage
  await setTabsData(tabs);

  // close all tabs
  await chrome.tabs.remove(ids);

  chrome.storage.local.get(['indexURL'], async props => {
    const indexURL = props.indexURL;
    console.log(indexURL);
    const [indexTab] = await chrome.tabs.query({ url: indexURL });

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
  });  
});

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
        // exclude empty tabs
        if (tabInfo.url !== 'chrome://newtab') {
          const tab = {
            id: uuid(),
            tabInfo: tabInfo
          };
          newTabs.push(tab);
        }
      });

      const newTabGroup = {
        id: uuid(),
        tabs: newTabs,
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