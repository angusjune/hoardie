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
  await chrome.storage.local.set({ tabs: tabs });

  // close all tabs
  // await chrome.tabs.remove(ids);

  // open homepage
  chrome.tabs.create({
    url: 'index.html',
    pinned: true,
  });

});