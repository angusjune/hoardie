<script>
    import TabGroup from './TabGroup.svelte';
    import Empty from './Empty.svelte';
    import Actions from './Actions.svelte';

    let tabGroups = [];
    let closeIfNoTabsLeft = false;
    
    chrome.runtime.sendMessage({ type: 'getTabGroups' }, result => {
        tabGroups = result;
        console.log(result);
    });

    chrome.runtime.sendMessage({ type: 'getSettings' }, result => {
        closeIfNoTabsLeft = result.closeIfNoTabsLeft
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local') {
            if (changes.tabGroups) {
                tabGroups = changes.tabGroups.newValue;
            }
        } else if (namespace === 'sync') {
            if (changes.closeIfNoTabsLeft) {
                closeIfNoTabsLeft = changes.closeIfNoTabsLeft.newValue;
            }
        }
    });

    // close app if there's no tabs left
    function checkCloseApp() {
        // get url of the app
        const appUrl = chrome.runtime.getURL('index.html');

        if (tabGroups.length <= 0 && closeIfNoTabsLeft) {     
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

    {#if tabGroups.length > 0}
    <Actions on:removeIdentical={mergeIdenticalTabs} on:mergeAll={mergeAllGroups} --merge-display={tabGroups.length < 2 ? 'none' : 'block'} />
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