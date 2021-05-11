'use strict';

chrome.action.onClicked.addListener(async tab => {
  // printURL();
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

function setTabsData(tabs) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['tabs'], async props => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      const formerTabs = props.tabs;
      const allTabs = formerTabs.concat(tabs);

      chrome.storage.local.set({ tabs: allTabs }, () => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve();
      });
    });
  });
}