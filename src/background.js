'use strict';

import { createTabGroup, createTab, TabGroups, TabGroup, Tab, defaultSettings } from './data.js';

chrome.runtime.onInstalled.addListener(() => {
  // add context menus
  chrome.contextMenus.create({
    contexts: ['action'],
    title: chrome.i18n.getMessage('ext_menu_display'),
    id: 'openApp'
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
  if (menuId === 'openApp') {
    openApp(true);
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

const tabGroups = [];
const settings  = {};

chrome.runtime.onMessage.addListener(({type, detail}, sender, sendResponse) => {
  if (type === 'getTabGroups') {
    getTabGroups().then(sendResponse);

  } else if (type === 'getSettings') {
    getSettings().then(sendResponse);

  } else {
    const response = () => {
      if (type === 'updateGroup') {
        updateGroup(detail.groupId, detail.data).then(sendResponse);
    
      } else if (type === 'removeGroup') {
        removeGroup(detail.groupId).then(sendResponse);
    
      } else if (type === 'updateTab') {
        updateTab(detail.tabId, detail.data).then(sendResponse);
    
      } else if (type === 'removeTab') {
        removeTab(detail.tabId).then(sendResponse);
    
      } else if (type === 'mergeIdenticalTabs') {
        mergeIdenticalTabs().then(sendResponse);

      } else if (type === 'mergeAllGroups') {
        mergeAllGroups().then(sendResponse);

      }
    }

    // if tabGroups is empty, retrieve it first
    if (tabGroups.length < 1) {
      getTabGroups().then(response);
    } else {
      response();
    }
  }
  return true;
});

function getTabGroups() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get({ tabGroups: [] }, props => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      Object.assign(tabGroups, props.tabGroups);
      resolve(props.tabGroups);
    });
  });
}

function getSettings() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(defaultSettings, props => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      Object.assign(settings, props);
      resolve(props);
    });
  });
}

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
    await addToTabGroups(usefulTabs);
  }

  // open hoardie
  await openApp();
  // close all tabs
  chrome.tabs.remove(ids);
}

function openApp(active = true) {
  // console.log(chrome.runtime.getURL('index.html'));
  return new Promise(async (resolve, reject) =>{
    // chrome.storage.local.get(['indexURL'], async props => {
      const indexURL = chrome.runtime.getURL('index.html');
      const [indexTab] = await chrome.tabs.query({ url: indexURL });

      // if hoardie is not already opened
      if (indexTab === undefined || indexURL === undefined) {
        // open homepage
        chrome.tabs.create({
          url: 'index.html',
          pinned: true,
          active,
        }, () => { resolve(); });
      } else {
        if (indexTab.active) {
          chrome.tabs.update(indexTab.id, {
            active,
          }, () => { resolve(); });
        } else { resolve(); }
      }
    // });
  });
}

// create a new tab group from new tabs
// and add to tab groups
function addToTabGroups(newTabInfo) {
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

function updateGroup(groupId, data) {
  return new Promise((resolve, reject) => {
    for(const [index, group] of tabGroups.entries()) {
        if (group.id === groupId) {
            tabGroups.splice(index, 1, {...group, ...data});
            break;
        }
    }

    chrome.storage.local.set({ tabGroups }, () => { resolve(tabGroups); });
  });
}

function removeGroup(groupId) {
  return new Promise((resolve, reject) => {
    const matchedGroup = tabGroups.find(el => el.id === groupId);
    const pinnedTabs = [];

    matchedGroup.tabs.forEach(tab => {
        // do not remove pinned tabs
        if (tab.pinned) {
            pinnedTabs.push(tab);
        }
    });
    
    if (pinnedTabs.length < 1) {
        // if there's no pinned tabs left, remove the entire group
        tabGroups.splice(tabGroups.indexOf(matchedGroup), 1);
    } else {
        // replace with a new group of pinned tabs
        matchedGroup.tabs = pinnedTabs;
        tabGroups.splice(tabGroups.indexOf(matchedGroup), 1, matchedGroup);
    }

    chrome.storage.local.set({ tabGroups }, () => { resolve(tabGroups); });
  });
}

function updateTab(tabId, data) {

  return new Promise((resolve, reject) => {
    for(const group of tabGroups) {

      for(const [index, tab] of group.tabs.entries()) {
        if (tab.id === tabId) {
          group.tabs.splice(index, 1, {...tab, ...data});
          break;
        }
      }

    }

    chrome.storage.local.set({ tabGroups }, () => { resolve(tabGroups); });
  });
}

function removeTab(tabId) {
  return new Promise((resolve, reject) => {
    
    for(const [index, group] of tabGroups.entries()) {
      const matchedTab = group.tabs.find(el => el.id === tabId);
      
      if (matchedTab !== undefined) {
        // do not remove a pinned tab
        if (matchedTab.pinned) break;
        // remove tab from group
        group.tabs.splice(group.tabs.indexOf(matchedTab), 1);
        
        if (group.tabs.length < 1) {
          // if no more tabs in the group, remove the entire group
          tabGroups.splice(index, 1);
        } else {
          // replace with new group
          tabGroups.splice(index, 1, group);
        }
        break;
      }
    }
    
    chrome.storage.local.set({ tabGroups }, () => { resolve(tabGroups); });
  });
}

function mergeIdenticalTabs() {
  return new Promise((resolve, reject) => {
    const allTabs = []
    // get every tab onboard
    tabGroups.forEach(group => {
        group.tabs.forEach(tab => {
            tab.groupId = group.id;
            allTabs.push(tab);
        })
    });
    allTabs.sort((a, b) => {
        if (a.pinned && !b.pinned) {
            return -1;
        } else if (!a.pinned && b.pinned) {
            return 1;
        } else {
            return b.createdTime - a.createdTime
        }
    });

    const uniqueUrlList = allTabs.filter((el, index, self) => 
        index === self.findIndex(t => (
            t.tabInfo.url === el.tabInfo.url
        )) || el.pinned
    );

    const newTabGroups = [];
    tabGroups.forEach(group => {
        group.tabs = [];
        uniqueUrlList.forEach(tab => {
            if (group.id === tab.groupId) {
                delete tab.groupId;
                group.tabs.push(tab);
            }
        });
        if (group.tabs.length > 0) {
            newTabGroups.push(group)
        }
    });

    chrome.storage.local.set({ tabGroups: newTabGroups }, () => { resolve(newTabGroups); });
  });
}

function mergeAllGroups() {
  return new Promise((resolve, reject) => {
    const newTabs = [];
    tabGroups.forEach(group => {
        group.tabs.forEach(newTabs.push);
    });
    if (newTabs.length > 0) {
        const newTabGroup = createTabGroup(newTabs);
        chrome.storage.local.set({ tabGroups: [newTabGroup] }, () => { resolve([newTabGroup]); });
    }
  });
}