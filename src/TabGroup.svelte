<script>
    import { fade } from 'svelte/transition';
    import { cubicIn } from 'svelte/easing';
    import {flip} from "svelte/animate";
    import {dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME} from "svelte-dnd-action";
    import { createEventDispatcher } from 'svelte';
    import IconButton from './IconButton.svelte';
    import TabList from './TabList.svelte';
    import EditableTitle from './EditableTitle.svelte';
    import { format, formatDistanceToNow } from 'date-fns';
    import { zhCN } from 'date-fns/locale';

    const dispatch = createEventDispatcher();
    const flipDurationMs = 200;

    export let group;

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

    function handleDndConsider(e) {
        // change the tabs of the groups in realtime 
        group.tabs = e.detail.items;
    }

    /**
     * @param groupId id of the group that changes
     */
    function handleDndFinalize(groupId, e) {
        // change the tabs of the group
        group.tabs = e.detail.items;

        // remove the group if there's no tabs left
        if (group.tabs.length < 1) {
            dispatch('removeGroup', {id: groupId})
        } 

        dispatch('modifyGroup', {id: groupId, data: group});
    }
</script>

<section class="tg" tabindex="0" role="group" aria-labelledby={'title-' + group.id}>

    <header class="tg-header">
        <div class="tg-header__titles">
            <!-- <h1 class="tg-header__title" id={'title-' + group.id}>{group.tabs?.length} <span data-msg="tabs">{group.tabs?.length <= 1 ? "Tab" : "Tabs"}</span></h1> -->
            <EditableTitle id={'title-' + group.id} :value={group.title} defaultValue={group.tabs?.length + (group.tabs?.length <= 1 ? " Tab" : " Tabs")} />
            <h2 class="tg-header__subtitle">
                {humanReadableDate(new Date(group.createdTime))} 
                <time class="tg-header__subtitle-desc" datetime={new Date(group.createdTime)}> - {format(new Date(group.createdTime), 'yyyy/MM/dd HH:mm:ss')}</time>
            </h2>
        </div>

        <div class="tg-header__menu" role="menu">
            <IconButton class="tg-header__menu-item" ariaLabel="Remove All" on:click={()=>dispatch('removeGroup', {id: group.id})}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 16H19V18H15V16ZM15 8H22V10H15V8ZM15 12H21V14H15V12ZM3 18C3 19.1 3.9 20 5 20H11C12.1 20 13 19.1 13 18V8H3V18ZM5 10H11V18H5V10ZM10 4H6L5 5H2V7H14V5H11L10 4Z" fill="var(--icon-ink)"/></svg>
            </IconButton>
            <IconButton class="tg-header__menu-item" ariaLabel="Open All" on:click={()=>dispatch('openTabsInGroup', {id: group.id})}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 4H5C3.89 4 3 4.9 3 6V18C3 19.1 3.89 20 5 20H9V18H5V8H19V18H15V20H19C20.1 20 21 19.1 21 18V6C21 4.9 20.11 4 19 4ZM12 10L8 14H11V20H13V14H16L12 10Z" fill="var(--icon-ink)"/></svg>
            </IconButton>
        </div>
    </header>
    
    <div class="tab-lists" role="list" 
        use:dndzone={{
            items: group.tabs,
            flipDurationMs,
            dropTargetStyle:'',
        }}
        on:consider={handleDndConsider}
        on:finalize={e => handleDndFinalize(group.id, e)}    
    >
        {#each group.tabs as tab (tab.id)}
        <div class="tab-lists__item" animate:flip={{duration: flipDurationMs}}>
            <TabList {...tab} on:click on:remove on:pinChange>{tab.tabInfo.title}</TabList>

            {#if tab[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
                <div in:fade={{duration:200, easing: cubicIn}} class='shadow-item'></div>
            {/if}
        </div>
        
        {/each}
    </div>

</section>

<style lang="scss">
    .tg {
        background: var(--surface);
        border-radius: 8px;
        margin-bottom: 16px;
        transition: box-shadow 0.12s ease-out;
        will-change: box-shadow;

        &:hover, &:focus {
            outline: 0;
            box-shadow: 0 10px 20px rgba(0,0,0,0.06);
        }
    }

    .tg-header {
        padding: 24px 32px 0 32px;
        display: flex;

       &__titles {
            display: flex;
            flex-direction: column;
            flex: 1;
            gap: 4px;
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
            margin: 0;
            display: inline-block;
            width: fit-content;
            cursor: default;
        }

        &__subtitle-desc {
            opacity: 0;
            transition: opacity 0.1s;

            .tg-header__subtitle:hover & {
                opacity: 1;
            }
        }

        &__menu {
            height: 24px;
            display: flex;
            gap: 16px;
            margin: 0;
            padding: 0;
        }
    }

    :global(.tg-header__menu-item) {
        opacity: 0;

        .tg:hover &, .tg:focus-within & {
            opacity: 1;
        }
    }

    .tab-lists {
        padding: 16px 0;

        &__item {
            position: relative;

            .shadow-item {
                position: absolute;
                top: 0;
                left: 8px;
                right: 8px;
                bottom: 0;
                border-radius: 8px;
                background: var(--background);
                opacity: 0.4;
                visibility: visible;
            }
        }
    }
</style>