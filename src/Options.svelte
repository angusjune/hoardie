<script>
    import Switch from './Switch.svelte';
    
    let closeIfNoTabsLeft = false;

    chrome.storage.sync.get({ closeIfNoTabsLeft: false }, props => {
        closeIfNoTabsLeft = props.closeIfNoTabsLeft;
    });

    function onCloseIfNoTabsLeftChange(event) {
        const closeIfNoTabsLeft = event.detail.checked;
        chrome.storage.sync.set({ closeIfNoTabsLeft });
    }
</script>

<Switch on={closeIfNoTabsLeft} on:change={onCloseIfNoTabsLeftChange}>Close hoardie if there's no tabs left</Switch>