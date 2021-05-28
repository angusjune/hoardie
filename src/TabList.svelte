<script>
    import IconButton from './IconButton.svelte';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    
    export let id;
    export let tabInfo;
    export let pinned = false;

    let favIconUrl = tabInfo.favIconUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTkgMS41QzQuODYgMS41IDEuNSA0Ljg2IDEuNSA5QzEuNSAxMy4xNCA0Ljg2IDE2LjUgOSAxNi41QzEzLjE0IDE2LjUgMTYuNSAxMy4xNCAxNi41IDlDMTYuNSA0Ljg2IDEzLjE0IDEuNSA5IDEuNVpNOC4yNSAxNC45NDc1QzUuMjg3NSAxNC41OCAzIDEyLjA2IDMgOUMzIDguNTM1IDMuMDYgOC4wOTI1IDMuMTU3NSA3LjY1NzVMNi43NSAxMS4yNVYxMkM2Ljc1IDEyLjgyNSA3LjQyNSAxMy41IDguMjUgMTMuNVYxNC45NDc1Wk0xMy40MjUgMTMuMDQyNUMxMy4yMyAxMi40MzUgMTIuNjc1IDEyIDEyIDEySDExLjI1VjkuNzVDMTEuMjUgOS4zMzc1IDEwLjkxMjUgOSAxMC41IDlINlY3LjVINy41QzcuOTEyNSA3LjUgOC4yNSA3LjE2MjUgOC4yNSA2Ljc1VjUuMjVIOS43NUMxMC41NzUgNS4yNSAxMS4yNSA0LjU3NSAxMS4yNSAzLjc1VjMuNDQyNUMxMy40NDc1IDQuMzM1IDE1IDYuNDg3NSAxNSA5QzE1IDEwLjU2IDE0LjQgMTEuOTc3NSAxMy40MjUgMTMuMDQyNVoiIGZpbGw9IiNDNEM0QzQiLz4KPC9zdmc+Cg==';
    let url = tabInfo.url;
    let iconalt;

    function onClickList(e) {
        dispatch('click', {...e, id: id, url: url, pinned: pinned});
    }

    // Keyboard shortcuts
    function onKeyDown(e) {
        if (e.code === 'Enter') {
            onClickList(e);
        } else if (e.code === 'KeyP') {
            pinned = !pinned;
            onChangePin(e);
        } else if (e.code === 'Backspace') {
            onClickRemove();
        }
    }

    function onClickRemove() {
      dispatch('remove', {
        id: id
      });
    }

    function onKeyDownRemove(e) {
        if (e.code === 'Enter') {
            onClickRemove();
        }
    }

    function onChangePin(e) {
        dispatch('pinChange', {
            ...e,
            id: id,
            pinned: pinned
        });
    }

    function onKeyDownPin(e) {
        if (e.code === 'Enter') {
            pinned = !pinned;
            onChangePin(e);
        }
    }

    function onClickPin() {}
</script>

<style lang="scss">
    .tab-list {
        font-size: 14px;
        position: relative;
        width: 100%;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        width: 100%;
        padding-inline-start: 32px;
        padding-inline-end: 32px;
        padding-top: 12px;
        padding-bottom: 12px;
        line-height: 24px;
        cursor: pointer;

        &:hover, &:focus {
            background: var(--theme-secondary);
            outline: 0;
        }
    }

    .tab-list__icon {
        display: block;
        width: 18px;
        height: 18px;
        margin-right: 12px;
        overflow: hidden;
    }

    .tab-list__icon img {
        width: 100%;
    }

    .tab-list__title {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .tab-list__menu {
        height: 24px;
        display: flex;
        gap: 16px;
    }

    :global(.tab-list__menu-item) {
        opacity: 0;
    }

    :global(.tab-list__menu-item:focus), .tab-list:hover :global(.tab-list__menu-item), .tab-list:focus :global(.tab-list__menu-item), .tab-list.pinned .toggle-pin {
        opacity: 1;
    }

    .toggle-pin {
        display: block;
        position: relative;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: none;
        background: none;
        padding: 0;

        &:focus {
            outline: 0;
        }

        &:before, &:after {
            position: absolute;
            top: -6px;
            left: -6px;
            content: '';
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background-color: var(--ripple);
        }

        &:before {
            opacity: 0;
            transition: opaicty 0.1s;
            will-change: opacity;
        }

        &:hover:before {
            opacity: 1;
        }

        &:after {
            transform: scale(0);
            transition: transform 0.12s;
            will-change: opacity, transform;
        }

        &:active:after, &:focus:after {
            transform: scale(1);
        }

        &:focus:after {
            background-color: var(--theme-secondary);
        }

        &__content {
            display: block;
            width: 100%;
            height: 100%;

            .icon-pinned {
                position: absolute;
                left: 0;
                top: 0;
                opacity: 0;
            }
        }

        input {
            display: none;

            &:checked ~ .toggle-pin__content {
                .icon-unpinned {
                    opacity: 0;
                }
                .icon-pinned {
                    opacity: 1;
                }
            }
        }
    }
</style>

<div class="tab-list" class:pinned={pinned} on:click={onClickList} on:keydown={onKeyDown} data-pinned={pinned} tabindex="0" role="listitem">
    <span class="tab-list__icon"><img src={favIconUrl} alt={iconalt} loading="lazy" role="presentation"/></span>
    <span class="tab-list__title"><slot></slot></span>
    <div class="tab-list__menu" role="menu">
        <IconButton class="tab-list__menu-item" ariaLabel="Remove" on:click={onClickRemove} on:keydown={onKeyDownRemove} hidden={pinned} stopPropagation={true}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="var(--icon-ink)"/></svg>
        </IconButton>
        <label class="tab-list__menu-item toggle-pin" for={"pin-" + id} on:click|stopPropagation={onClickPin} on:keydown|stopPropagation={onKeyDownPin} tabindex="0" role="switch" aria-checked={pinned} aria-label="Pin">
            <input bind:checked={pinned} type="checkbox" id={"pin-" + id} on:change={onChangePin}>
            <i class="toggle-pin__content">
                <span class="icon-unpinned"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 4V9C14 10.12 14.37 11.16 15 12H9C9.65 11.14 10 10.1 10 9V4H14ZM17 2H7C6.45 2 6 2.45 6 3C6 3.55 6.45 4 7 4H8V9C8 10.66 6.66 12 5 12V14H10.97V21L11.97 22L12.97 21V14H19V12C17.34 12 16 10.66 16 9V4H17C17.55 4 18 3.55 18 3C18 2.45 17.55 2 17 2Z" fill="var(--icon-ink)"/></svg></span>
                <span class="icon-pinned"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M16 9V4H17C17.55 4 18 3.55 18 3C18 2.45 17.55 2 17 2H7C6.45 2 6 2.45 6 3C6 3.55 6.45 4 7 4H8V9C8 10.66 6.66 12 5 12V14H10.97V21L11.97 22L12.97 21V14H19V12C17.34 12 16 10.66 16 9Z" fill="var(--theme)"/></svg></span>
            </i>
        </label>
    </div>
</div>