<script>
    import { format, formatDistanceToNow } from 'date-fns';
    import { zhCN } from 'date-fns/locale';
    import TabList from './TabList.svelte';
    import IconButton from './IconButton.svelte';
    import { createTabGroup } from './data.js';

    const url = chrome.runtime.getURL('index.html');
    chrome.storage.local.set({ indexURL: url });

    let tabGroups = [];
    chrome.storage.local.get(['tabGroups'], props => {
        console.log(props);
        tabGroups = props.tabGroups;
    });

    function openTab(url) {
        chrome.tabs.create({
            url: url,
            index: 1,
            active: false,
        });
    }

    function openTabsInGroup(groupId) {
        const matchedGroup = tabGroups.find(el => el.id === groupId);
        matchedGroup.tabs.forEach(tab => {
            openTab(tab.tabInfo.url);
        });
        removeGroup(groupId);
    }

    function removeTab(tabId) {
        tabGroups.forEach((group, i) => {
            const matchedTab = group.tabs.find(el => el.id === tabId);

            if (matchedTab !== undefined) {
                // do not remove a pinned tab
                if (matchedTab.pinned) return;
                // remove tab from group
                group.tabs.splice(group.tabs.indexOf(matchedTab), 1);

                if (group.tabs.length < 1) {
                    // if no more tabs in the group, remove the entire group
                    tabGroups.splice(i, 1);
                } else {
                    // replace with new group
                    tabGroups.splice(i, 1, group);
                }

                chrome.storage.local.set({ tabGroups: tabGroups });
                return;
            }
        });
    }

    /**
     * 
     * @param {string} groupId
     * @param {boolean} force if force is true, pinned tabs in the group will also be removed
     */
    function removeGroup(groupId, force = false) {
        const matchedGroup = tabGroups.find(el => el.id === groupId);
        if (force) {
            tabGroups.splice(tabGroups.indexOf(matchedGroup), 1);
        } else {
            let newTabs = [];

            matchedGroup.tabs.forEach(tab => {
                if (tab.pinned) {
                    newTabs.push(tab);
                }
            });
            
            if (newTabs.length <= 0) {
                tabGroups.splice(tabGroups.indexOf(matchedGroup), 1);
            } else {
                matchedGroup.tabs = newTabs;
                tabGroups.splice(tabGroups.indexOf(matchedGroup), 1, matchedGroup);
            }
        }

        chrome.storage.local.set({ tabGroups: tabGroups });
    }

    function mergeAll() {
        let newTabs = [];
        tabGroups.forEach(group => {
            group.tabs.forEach(tab => {
                newTabs.push(tab);
            });
        });
        if (newTabs.length > 0) {
            const newTabGroup = createTabGroup(newTabs);
            chrome.storage.local.set({ tabGroups: [newTabGroup] });
        }
    }

    function removeIdentical() {
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

        chrome.storage.local.set({ tabGroups: newTabGroups });
    }

    function removeAll() {
        chrome.storage.local.set({ tabGroups: [] });
    }

    function onClickOpenTabsInGroup(e) {
        const groupId = e.detail.target.dataset.id;
        openTabsInGroup(groupId)
    }

    function onClickRemoveGroup(e) {
        const groupId = e.detail.target.dataset.id;
        removeGroup(groupId);
    }

    function onClickTab(e) {
        const tabId = e.detail.id;
        const url   = e.detail.url;
        const pinned = e.detail.pinned;

        openTab(url);
        if (!pinned) {
            removeTab(tabId);
        }
    }

    function onRemoveTab(e) {
        const tabId = e.detail.id;
        removeTab(tabId);
    }

    function onPinChangeTab(e) {
        const tabId = e.detail.id;
        const pinned = e.detail.pinned;

        tabGroups.forEach(group => {
            group.tabs.forEach(tab => {
                if (tab.id === tabId) {
                    tab.pinned = pinned;
                }
            });
        });

        chrome.storage.local.set({ tabGroups: tabGroups });
    }

    function humanReadableDate(comparisonDate) {
        const lang = chrome.i18n.getUILanguage();
        let result;
        if (lang === 'zh-CN') {
            result = formatDistanceToNow(comparisonDate, { locale: zhCN});
        } else {
            result = formatDistanceToNow(comparisonDate);
        }
        return result;
    }

    chrome.storage.onChanged.addListener(async changes => {
        if (changes.tabGroups) {
            tabGroups = changes.tabGroups.newValue;
        }
    });
</script>

<style lang="scss">
    @use 'base';
    @include base.core-styles();

    :global(body) {
        color: var(--primary);
        background: var(--background);
    }

    .container {
        width: 90%;
        max-width: 800px;
        margin: auto;
        padding: 64px 0;
    }
    .card {
        background: var(--surface);
        border-radius: 8px;
        margin-bottom: 16px;

        &:hover .header__menu {
            opacity: 1;
        }
    }

    .header {
        padding: 24px 32px 0 32px;
        
        &__title-wrapper {
            display: flex;
        }

        &__title {
            flex: 1;
            margin: 0;
            padding: 0;
            font-size: 24px;
            font-weight: 500;
        }

        &__subtitle {
            color: var(--secondary);
            font-size: 14px;
            font-weight: normal;
            margin: 4px 0 0 0;
            display: inline-block;
        }

        &__subtitle-desc {
            opacity: 0;
            transition: opacity 0.1s;

            .header__subtitle:hover & {
                opacity: 1;
            }
        }

        &__menu {
            height: 24px;
            list-style: none;
            margin: 0;
            padding: 0;
            opacity: 0;
        }

        &__menu-item {
            display: inline-block;
            margin-left: 16px;
        }
    }

    .tab-lists {
        padding: 16px 0;
    }
</style>

<button on:click={mergeAll}>Merge All</button>
<button on:click={removeIdentical}>Remove Identical</button>

<div class="container">
    <main class="main">
        {#each tabGroups as group (group.id)}
        <section class="card">

            <header class="header">
                <div class="header__title-wrapper">
                    <h2 class="header__title">{group.tabs.length} <span data-msg="tabs">{group.tabs.length <= 1 ? "Tab" : "Tabs"}</span></h2>
                    <ul class="header__menu">
                        <li class="header__menu-item">
                            <IconButton ariaLabel="clear all" on:click={onClickRemoveGroup} dataId={group.id}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 16H19V18H15V16ZM15 8H22V10H15V8ZM15 12H21V14H15V12ZM3 18C3 19.1 3.9 20 5 20H11C12.1 20 13 19.1 13 18V8H3V18ZM5 10H11V18H5V10ZM10 4H6L5 5H2V7H14V5H11L10 4Z" fill="var(--icon-ink)"/></svg>                                    
                            </IconButton>
                        </li>
                        <li class="header__menu-item">
                            <IconButton ariaLabel="open all tabs" on:click={onClickOpenTabsInGroup} dataId={group.id}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 4H5C3.89 4 3 4.9 3 6V18C3 19.1 3.89 20 5 20H9V18H5V8H19V18H15V20H19C20.1 20 21 19.1 21 18V6C21 4.9 20.11 4 19 4ZM12 10L8 14H11V20H13V14H16L12 10Z" fill="var(--icon-ink)"/></svg>                                    
                            </IconButton>
                        </li>
                    </ul>
                </div>
                <h6 class="header__subtitle">{humanReadableDate(new Date(group.createdTime))} <time class="header__subtitle-desc"> - {format(new Date(group.createdTime), 'yyyy/MM/dd HH:mm:ss')}</time></h6>    
            </header>
            
            <div class="tab-lists">
                {#each group.tabs as tab (tab.id)}
                    <TabList {...tab} on:click={onClickTab} on:remove={onRemoveTab} on:pinChange={onPinChangeTab}>{tab.tabInfo.title}</TabList>
                {/each}
            </div>

        </section>
        {/each}
    </main>
</div>

<!-- <button id="btnClearAll" on:click={removeAll}>Clear All</button> -->