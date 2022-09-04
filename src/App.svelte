<script>
    import TabGroup from './TabGroup.svelte';
    import Empty from './Empty.svelte';
    import Actions from './Actions.svelte';
    import { createTabGroup } from './data.js';

    const indexURL = chrome.runtime.getURL('index.html');
    chrome.storage.local.set({ indexURL });

    let tabGroups = [];
    let closeIfNoTabsLeft = false;
    
    chrome.storage.local.get({tabGroups: []}, props => {
        console.log(props);
        tabGroups = props.tabGroups;
    });

    chrome.storage.sync.get({ closeIfNoTabsLeft: false }, props => {
        closeIfNoTabsLeft = props.closeIfNoTabsLeft;
    });

    // close app if there's no tabs left
    function checkCloseApp(shouldClose) {
        if (tabGroups.length <= 0 && shouldClose) {            
            chrome.tabs.query({ url: indexURL }, info => {
                // create a new tab if the app is the last tab
                chrome.tabs.query({}, tabs => {
                    if (tabs.length <= 1) {
                        console.log('no tabs left');
                        chrome.tabs.create({ url: 'chrome://newtab/' });
                    }
                    // remove the app tab
                    chrome.tabs.remove(info[0].id);
                });
            });
        }
    }

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

                chrome.storage.local.set({ tabGroups });

                checkCloseApp(closeIfNoTabsLeft);

                return;
            }
        });
    }

    /**
     * Remove a group of tabs
     * @param {string} groupId id of the group to be removed
     * @param {boolean} force if force is true, pinned tabs in the group will also be removed
     */
    function removeGroup(groupId, force = false) {
        const matchedGroup = tabGroups.find(el => el.id === groupId);
        if (force) {
            tabGroups.splice(tabGroups.indexOf(matchedGroup), 1);
        } else {
            let newTabs = [];

            matchedGroup.tabs.forEach(tab => {
                // do not remove pinned tabs
                if (tab.pinned) {
                    newTabs.push(tab);
                }
            });
            
            if (newTabs.length <= 0) {
                // if there's no pinned tabs, remove the entire group
                tabGroups.splice(tabGroups.indexOf(matchedGroup), 1);
            } else {
                // replace with a new group of pinned tabs
                matchedGroup.tabs = newTabs;
                tabGroups.splice(tabGroups.indexOf(matchedGroup), 1, matchedGroup);
            }
        }

        chrome.storage.local.set({ tabGroups });

        checkCloseApp(closeIfNoTabsLeft);
    }

    function modifyGroup(groupId, data) {
        tabGroups.forEach((group, i) => {
            if (group.id === groupId) {
                tabGroups.splice(i, 1, data);
                chrome.storage.local.set({ tabGroups });
                return;
            }
        });
    }

    function mergeAll() {
        const newTabs = [];
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

    function removeIndexURL() {
        chrome.storage.local.remove('indexURL', ()=>{
            console.log('removed');
            chrome.storage.local.get('indexURL', props => {
                console.log(props);
            })
        });
    }

    // function removeAll() {
    //     chrome.storage.local.set({ tabGroups: [] });
    // }


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

        chrome.storage.local.set({ tabGroups });
    }

    chrome.storage.onChanged.addListener(async changes => {
        if (changes.tabGroups) {
            tabGroups = changes.tabGroups.newValue;
        }
    });


</script>

<div class="container">
    <main class="main">
        {#each tabGroups as group (group.id)}
        <TabGroup {group}
            on:removeGroup={(e)=>removeGroup(e.detail.id)} 
            on:openTabsInGroup={(e)=>openTabsInGroup(e.detail.id)}
            on:modifyGroup={(e)=>modifyGroup(e.detail.id, e.detail.data)}
            on:click={onClickTab} 
            on:remove={onRemoveTab} 
            on:pinChange={onPinChangeTab}
        />
        {:else}
        <Empty />
        {/each}
    </main>

    {#if tabGroups.length > 0}
    <Actions on:removeIdentical={removeIdentical} on:mergeAll={mergeAll} />
    {/if}
</div>

<style lang="scss">
    @use 'base';
    @include base.core-styles();

    :global(body) {
        color: var(--primary);
        background: var(--background);
    }

    .container {
        position: relative;
        width: 90%;
        max-width: 800px;
        margin: auto;
        padding: 32px 0;
    }
</style>