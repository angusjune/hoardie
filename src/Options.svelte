<script>
    import ToggleRow from './ToggleRow.svelte';
    import LinkRow from './LinkRow.svelte';
    
    let settings;
    let closeIfNoTabsLeft = false;

    chrome.runtime.sendMessage({ type: 'getSettings' }, result => {
        settings = result;
        console.log(settings);
    });

    chrome.storage.sync.get({ closeIfNoTabsLeft: false }, props => {
        closeIfNoTabsLeft = props.closeIfNoTabsLeft;
    });

    function onCloseIfNoTabsLeftChange(event) {
        const closeIfNoTabsLeft = event.detail.checked;
        chrome.storage.sync.set({ closeIfNoTabsLeft });
    }

    const localeCloseIfEmpty  = chrome.i18n.getMessage('option_close_if_empty') || "Close Hoardie if there's no tabs left";
    const localeEditShortcuts = chrome.i18n.getMessage('option_edit_shortcuts') || "Edit shortcuts";
</script>

<ToggleRow on={closeIfNoTabsLeft} on:change={onCloseIfNoTabsLeftChange}>{localeCloseIfEmpty}</ToggleRow>
<hr />
<LinkRow href="chrome://extensions/shortcuts">{localeEditShortcuts}</LinkRow>

<style lang="scss" scoped>
    @use 'base';
    @include base.core-styles();

    :global(body.theme--light) {
        background: #fff;
    }

    :global(body.theme--dark) {
        background: #292a2d;
    }

    hr {
        border: 0;
        border-bottom: 0.5px solid rgba(0,0,0,.08);
        margin: 0;
    }
</style>