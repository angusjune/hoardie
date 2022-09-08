'use strict';
import { uuid } from './utils.js';

class TabGroups {
    /**
     * 
     * @param {Array<TabGroup>} [groups] 
     */
    constructor(groups) {
        this.groups = groups || [];
    }

    get groups() {
        return this._groups;
    }

    set groups(value) {
        this._groups = [];
        this.add(value);
    }

    /**
     * Iterates over groups
     */
    *nextGroup() {
        for (const group of this.groups) {
          yield group;
        }
    }

    /** 
     * Add a tab group
     * @param {TabGroup|Array<TabGroup>} value
     * @returns {Array<TabGroup>} groups
     */
    add(value) {
        value = Array.from(value);

        for(const group of value) {
            if (group.constructor.name === 'TabGroup') {
                this.groups.push(group);
            } else {
                throw new Error('Invalid argument: value must be a TabGroup object');
            }
        }

        return this.groups;
    }

    update(id, value) {
        // replace the group with id in this.groups with value
        this.groups = this.groups.map(group => {
            if (group.id === id) {
                return value;
            } else {
                return group;
            }
        });
        return this.groups;
    }

    find(id) {
        return this.groups.find(group => group.id === id);
    }

    /**
     * Remove a tab group
     * @param {string} id tab group id
     * @returns {Array<TabGroup>}
     */
    remove(id) {
        this.groups = this.groups.filter(group => group.id !== id);
        return this.groups;
    }
}

/** Class representing a Tab Group. */
class TabGroup {
    id = uuid();
    pinned = false;
    /**
     * Creates a TabGroup
     * @param {Array<Tab>} [tabs]
    */
    constructor(tabs) {
        // id = uuid();
        this.title = '';
        this.tabs = tabs || [];
        this.createdTime = Date.now();
        // this.modifiedTime = Date.now();
        // this.pinned = false;
    }

    get id() {
        return id;
    }

    get title() {
        return this._title;
    }

    get tabs() {
        return this._tabs;
    }

    get createdTime() {
        return this._createdTime;
    }

    get modifiedTime() {
        return this._modifiedTime;
    }

    get pinned() {
        return pinned;
    }

    /** @param {string} value */
    set title(value) {
        this._title = value;
        this.modifiedTime = Date.now();
    }

    /** @param {Array<Tab>} tabs */
    set tabs(value) {
        this._tabs = [];
        this.add(value);
    }

    set createdTime(value) {
        this._createdTime = value;
    }

    set modifiedTime(value) {
        this._modifiedTime = value;
    }

    /**
     * Add a tab or array of tabs to the group
     * @param {Tab|Array<Tab>} value
     * @returns {Array<Tab>} tabs
     * */
    add(value) {
        value = Array.from(value);

        for(const tab of value) {
            if (tab.constructor.name === 'Tab') {
                this.tabs.push(value);
            } else {
                throw new Error('Invalid argument: value must be a Tab object');
            }

            this.tabs.push(tab);
        }
        this.modifiedTime = Date.now();
        return this.tabs;
    }

    pin() {
        pinned = true;
        return pinned;
    }

    unpin() {
        pinned = false;
        return pinned;
    }

    isInArray(array) {
        return array.some((tabGroup) => tabGroup.id === id);
    }
}


class Tab {
    id = uuid();
    pinned = false;

    /**
     * Creates a Tab
     * @param {import('@types/chrome').chrome.tabs.Tab} info 
     */
    constructor(info) {
        this.info = info;
    }

    get id() {
        return id;
    }

    get pinned() {
        return pinned;
    }

    get info() {
        return this._info;
    }

    set info(value) {
        this._info = value;
    }

    // get() {
    //     return {
    //         id: this.id,
    //         tabInfo: this.info,
    //         pinned: pinned,
    //     }
    // }

    // getUrl() {
    //     return this.info?.url;
    // }

    pin() {
        pinned = true;
        return pinned;
    }

    unpin() {
        pinned = false;
        return pinned;
    }
}

/**
 * Creates a Tab Group
 * @param {Array<Tab>} tabs
 * @param {boolean} pinned
 * @returns {TabGroup}
 */
function createTabGroup(tabs, pinned = false) {
    return {
        id: uuid(),
        tabs: tabs,
        pinned: pinned,
        createdTime: Date.now(),
        modifiedTime: Date.now(),
    };
}

/**
 * 
 * @param {Tab} tabInfo 
 * @param {boolean} pinned 
 * @returns 
 */
function createTab(tabInfo, pinned = false) {
    return {
        id: uuid(),
        pinned: pinned,
        tabInfo: tabInfo
    };
}
const version = chrome.runtime.getManifest().version;
const defaultSettings = { closeIfNoTabsLeft: false };

export { createTabGroup, createTab, TabGroup, Tab, TabGroups, defaultSettings };