<script>
    import './tabListComponent';

    const url = chrome.runtime.getURL('index.html');
    chrome.storage.local.set({indexURL: url });

    let list = [];
    let tabs = [];
    chrome.storage.local.get(['tabs'], props => {
        console.log(props);
        tabs = props.tabs;
    });

    function tabListClick() {
        
    }

    function clearAll() {
        chrome.storage.local.set({ tabs: [] });
    };

    chrome.storage.onChanged.addListener(changes => {
        if (changes.tabs) {
            tabs = changes.tabs.newValue;
        }
    })
</script>

<ul>
    {#each tabs as {id, title, favIconUrl}, i}
        <tab-list id={id} iconurl={favIconUrl} on:click={tabListClick}>{title}</tab-list>
    {/each}
</ul>

<button id="btnClearAll" on:click={clearAll}>Clear All</button>