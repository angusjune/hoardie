'use strict';
import { uuid } from './utils.js';

/**
 * @typedef TabGroup
 * @property {string} id
 * @property {Array} tabs
 * @property {number} createdTime
 * @property {boolean} pinned
 */

/**
 * Creates a Tab Group
 * @param {Array} tabs
 * @param {boolean} pinned
 * @returns {TabGroup}
 */
function createTabGroup(tabs, pinned = false) {
    return {
        id: uuid(),
        tabs: tabs,
        pinned: pinned,
        createdTime: Date.now(),
    };
}

/**
 * 
 * @param {Object} tabInfo 
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

export { createTabGroup, createTab };