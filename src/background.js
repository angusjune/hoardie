'use strict';

import { createTabGroup, createTab } from './data.js';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    contexts: ['action'],
    title: chrome.i18n.getMessage('ext_menu_display'),
    id: 'openIndex'
  });
  chrome.contextMenus.create({
    contexts: ['action'],
    title: chrome.i18n.getMessage('command_desc_hoard_all'),
    id: 'hoardAllTabs'
  });
  chrome.contextMenus.create({
    contexts: ['action'],
    title: chrome.i18n.getMessage('command_desc_hoard_this'),
    id: 'hoardThisTab'
  });
});

chrome.contextMenus.onClicked.addListener(info => {
  const menuId = info.menuItemId;
  if (menuId === 'openIndex') {
    openIndex(true);
  } else if (menuId === 'hoardAllTabs') {
    hoard();
  } else if (menuId === 'hoardThisTab') {
    chrome.tabs.query({ currentWindow: true, active: true }, hoard);
  }
});

chrome.action.onClicked.addListener(async tab => {
  await hoard();
});

chrome.commands.onCommand.addListener(command => {
  if (command === 'hoard-this') {
    chrome.tabs.query({ currentWindow: true, active: true }, hoard);
  }
});

async function hoard(tabs) {
  // get all unpinned tabs in current window
  tabs = tabs || await chrome.tabs.query({ currentWindow: true, pinned: false });
    
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
      if (indexTab === undefined || indexURL === undefined) {
        // open homepage
        chrome.tabs.create({
          url: 'index.html',
          pinned: true,
          active: active,
        }, () => {
          resolve();
        });
      } else {
        if (indexTab.active) {
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