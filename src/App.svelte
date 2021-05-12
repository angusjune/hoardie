<script>
    import { formatDistanceToNowStrict } from 'date-fns';
    import { zhCN } from 'date-fns/locale';
    import TabList from './TabList.svelte';

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
        const [matchedGroup] = tabGroups.filter(el => el.id === groupId);
        matchedGroup.tabs.forEach(tab => {
            openTab(tab.tabInfo.url);
        });
        clearGroup(groupId);
    }

    function clearList(tabId) {
        tabGroups.forEach((group, i) => {
            const [matchedTab] = group.tabs.filter(el => el.id === tabId);

            if (matchedTab !== undefined) {
                // remove tab from group
                group.tabs.splice(group.tabs.indexOf(matchedTab), 1);
                // replace with new group
                tabGroups.splice(i, 1, group);

                chrome.storage.local.set({ tabGroups: tabGroups });
                return;
            }
        });
    }

    function clearGroup(groupId) {
        const [matchedGroup] = tabGroups.filter(el => el.id === groupId);
        tabGroups.splice(tabGroups.indexOf(matchedGroup), 1);

        chrome.storage.local.set({ tabGroups: tabGroups });
    }

    function clearAll() {
        chrome.storage.local.set({ tabGroups: [] });
    }

    function onClickOpenTabsInGroup(e) {
        const groupId = e.target.dataset.groupId;
        openTabsInGroup(groupId)
    }

    function onClickClearGroup(e) {
        const groupId = e.target.dataset.groupId;
        clearGroup(groupId);
    }

    function onMessageList(e) {
        const tabId = e.detail.id;
        const url   = e.detail.url;

        openTab(url);
        clearList(tabId);
    }

    chrome.storage.onChanged.addListener(changes => {
        if (changes.tabGroups) {
            tabGroups = changes.tabGroups.newValue;
        }
    });
</script>

<ul>
    {#each tabGroups as group (group.id)}
    <section>
        <h6>{group.createdTime}</h6>
        <h6>{group.tabs.length}</h6>
        <button on:click={onClickClearGroup} data-group-id={group.id}>Clear group</button>
        <button on:click={onClickOpenTabsInGroup} data-group-id={group.id}>Open group</button>

        {#each group.tabs as tab (tab.id)}
            <TabList {...tab} on:message={onMessageList}>{tab.tabInfo.title}</TabList>
        {/each}

        <hr>
    </section>
    {/each}
</ul>

<button id="btnClearAll" on:click={clearAll}>Clear All</button>