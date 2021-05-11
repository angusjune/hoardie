'use strict';

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
  // await chrome.tabs.remove(ids);

  chrome.storage.local.get(['indexId'], props => {
    const indexId = props.indexId;

    if (indexId === undefined) {
      // open homepage
      chrome.tabs.create({
        url: 'index.html',
        pinned: true,
      }, tab => {
        console.log(tab.id);
        chrome.storage.local.set({ indexId: tab.id })
      });
    } else {
      try {
        // update homepage
        chrome.tabs.update(indexId, {
          url: 'index.html',
          pinned: true
        });
      } catch (e) {
        console.error(e);
        chrome.storage.local.remove(['indexId']);
      }
    }
  });  
});

function setTabsData(tabs) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ tabs: tabs }, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve();
    });
  })
}

chrome.tabs.onRemoved.addListener(async (tabId, info) => {
  const indexId = await chrome.storage.local.get(['indexId']);
  if (tabId === indexId) {
    chrome.storage.local.remove(['indexId']);
  }
});