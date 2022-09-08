<script>
    import { defaultSettings } from './data.js';
    import TabGroup from './TabGroup.svelte';
    import Empty from './Empty.svelte';
    import SideMenu from './SideMenu.svelte';
    import SideMenuItem from './SideMenuItem.svelte';

    let tabGroups = [];
    let settings = defaultSettings;
    
    chrome.runtime.sendMessage({ type: 'getTabGroups' }, result => {
        tabGroups = result;
        console.log(result);
    });

    chrome.runtime.sendMessage({ type: 'getSettings' }, result => {
        settings = result;
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local') {
            if (changes.tabGroups) {
                tabGroups = changes.tabGroups.newValue;
            }
        } else if (namespace === 'sync') {
            if (changes) {
                for (const key in changes) {
                    settings[key] = changes[key].newValue;
                }
            }
        }
    });

    // close app if there's no tabs left
    function checkCloseApp() {
        // get url of the app
        const appUrl = chrome.runtime.getURL('index.html');

        if (tabGroups?.length <= 0 && settings?.closeIfNoTabsLeft) {     
            chrome.tabs.query({}, tabs => {
                // create a new tab if there's no other tabs
                if (tabs.length <= 1) {
                    chrome.tabs.create();
                }

                // remove the tab with url of appUrl
                tabs.forEach(tab => {
                    if (tab.url === appUrl) {
                        chrome.tabs.remove(tab.id);
                    }
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
        chrome.runtime.sendMessage({ type: 'removeTab', detail: {tabId} }, () => {
            checkCloseApp();
        });
    }

    function removeGroup(groupId) {
        chrome.runtime.sendMessage({ type: 'removeGroup', detail: {groupId} }, () => {
            checkCloseApp();
        });
    }

    function updateGroup(groupId, data) {
        chrome.runtime.sendMessage({ type: 'updateGroup', detail: {groupId, data} });
    }

    function mergeAllGroups() {
        chrome.runtime.sendMessage({ type: 'mergeAllGroups' });
    }

    function mergeIdenticalTabs() {
        chrome.runtime.sendMessage({ type: 'mergeIdenticalTabs' });
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

        chrome.runtime.sendMessage({ type: 'updateTab', detail: {tabId, data: {pinned}} }, result => {
            tabGroups = result;
        });
    }

</script>

<div class="container">
    <main class="main">
        {#each tabGroups as group (group.id)}
        <TabGroup {group}
            on:removeGroup={(e)=>removeGroup(e.detail.id)} 
            on:openTabsInGroup={(e)=>openTabsInGroup(e.detail.id)}
            on:updateGroup={(e)=>updateGroup(e.detail.id, e.detail.data)}
            on:click={onClickTab} 
            on:remove={onRemoveTab} 
            on:pinChange={onPinChangeTab}
        />
        {:else}
        <Empty />
        {/each}
    </main>

    {#if tabGroups?.length > 0}
    <SideMenu>
        <SideMenuItem ariaLabel="Remove Identical Tabs" on:click={mergeIdenticalTabs}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 16L13 12V8.82C14.16 8.4 15 7.3 15 6C15 4.34 13.66 3 12 3C10.34 3 9 4.34 9 6C9 7.3 9.84 8.4 11 8.82V12L7 16H3V21H8V17.95L12 13.75L16 17.95V21H21V16H17Z" fill="var(--icon-ink)"/></svg>
        </SideMenuItem>

        {#if tabGroups?.length > 1}
        <SideMenuItem ariaLabel="Merge All Groups" on:click={mergeAllGroups}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.41 18.59L8.83 20L12 16.83L15.17 20L16.58 18.59L12 14L7.41 18.59ZM16.59 5.41L15.17 4L12 7.17L8.83 4L7.41 5.41L12 10L16.59 5.41Z" fill="var(--icon-ink)"/></svg>
        </SideMenuItem>
        {/if}
    </SideMenu>
    {/if}
</div>

<style lang="scss">
    @use 'base';
    @include base.core-styles();

    :global(body) {
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