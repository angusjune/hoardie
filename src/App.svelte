<script>
    import { format, formatDistanceToNow } from 'date-fns';
    import { zhCN } from 'date-fns/locale';
    import TabList from './TabList.svelte';
    import IconButton from './IconButton.svelte';
    import { createTabGroup } from './data.js';

    const indexURL = chrome.runtime.getURL('index.html');
    chrome.storage.local.set({ indexURL });

    let tabGroups = [];
    let closeIfNoTabsLeft = false;
    
    chrome.storage.local.get({tabGroups: []}, props => {
        console.log(props);
        tabGroups = props.tabGroups;
    });

    chrome.storage.sync.get({ closeIfNoTabsLeft: true }, props => {
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

        chrome.storage.local.set({ tabGroups });

        checkCloseApp(closeIfNoTabsLeft);
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

    function removeIndexURL() {
        chrome.storage.local.remove('indexURL', ()=>{
            console.log('removed');
            chrome.storage.local.get('indexURL', props => {
                console.log(props);
            })
        });
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
        position: relative;
        width: 90%;
        max-width: 800px;
        margin: auto;
        padding: 32px 0;
    }

    .card {
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

    .header-wrapper {
        padding: 24px 32px 0 32px;
        display: flex;
    }

    .header {
        display: flex;
        flex-direction: column;
        flex: 1;
        gap: 4px;

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
        }

        &__subtitle-desc {
            opacity: 0;
            transition: opacity 0.1s;

            .header__subtitle:hover & {
                opacity: 1;
            }
        }
    }

    .card__menu {
        height: 24px;
        display: flex;
        gap: 16px;
        margin: 0;
        padding: 0;
    }

    :global(.card__menu-item) {
        opacity: 0;
    }

    .card:hover :global(.card__menu-item), .card:focus :global(.card__menu-item), :global(.card__menu-item:focus) {
        opacity: 1;
    }

    .tab-lists {
        padding: 16px 0;
    }

    .actions {
        position: fixed;
        bottom: 64px;
        right: 64px;
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 16px;

        &__item {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            overflow: hidden;
            background: var(--surface);
            box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
        }
    }

    .empty {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding-top: 25vh;

        &__illustration {
            margin: 0;

            &__tab1, &__tab2 {
                will-change: transform;
                transition: transform 0.16s ease-in;
            }

            &:hover {
                .empty__illustration__tab1 {
                    transition: transform 0.14s ease-out;
                    transform: translateY(-4px);
                }
                .empty__illustration__tab2 {
                    transition: transform 0.16s 0.04s ease-out;
                    transform: translateY(-8px);
                }
            }
        }

        &__title {
            margin: 32px 0 0;
            font-size: 18px;
            font-weight: 500;
        }
    }

    @media screen and (max-width: 900px) {
        .actions__item {
            box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.2);
        }
    }
</style>

<div class="container">
    <main class="main">
        {#each tabGroups as group (group.id)}
        <section class="card" tabindex="0" role="group" aria-labelledby={'title-' + group.id}>

            <div class="header-wrapper">
                <header class="header">
                    <h2 class="header__title" id={'title-' + group.id}>{group.tabs.length} <span data-msg="tabs">{group.tabs.length <= 1 ? "Tab" : "Tabs"}</span></h2>
                    <h3 class="header__subtitle">{humanReadableDate(new Date(group.createdTime))} <time class="header__subtitle-desc"> - {format(new Date(group.createdTime), 'yyyy/MM/dd HH:mm:ss')}</time></h3>
                </header>
                <div class="card__menu" role="menu">
                    <IconButton class="card__menu-item" ariaLabel="Remove All" on:click={onClickRemoveGroup} dataId={group.id}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 16H19V18H15V16ZM15 8H22V10H15V8ZM15 12H21V14H15V12ZM3 18C3 19.1 3.9 20 5 20H11C12.1 20 13 19.1 13 18V8H3V18ZM5 10H11V18H5V10ZM10 4H6L5 5H2V7H14V5H11L10 4Z" fill="var(--icon-ink)"/></svg>
                    </IconButton>
                    <IconButton class="card__menu-item" ariaLabel="Open All" on:click={onClickOpenTabsInGroup} dataId={group.id}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 4H5C3.89 4 3 4.9 3 6V18C3 19.1 3.89 20 5 20H9V18H5V8H19V18H15V20H19C20.1 20 21 19.1 21 18V6C21 4.9 20.11 4 19 4ZM12 10L8 14H11V20H13V14H16L12 10Z" fill="var(--icon-ink)"/></svg>
                    </IconButton>
                </div>
            </div>
            
            <div class="tab-lists" role="list">
                {#each group.tabs as tab (tab.id)}
                    <TabList {...tab} on:click={onClickTab} on:remove={onRemoveTab} on:pinChange={onPinChangeTab}>{tab.tabInfo.title}</TabList>
                {/each}
            </div>

        </section>
        {/each}
        {#if tabGroups.length <= 0}
        <div class="empty">
            <figure class="empty__illustration">
                <svg width="150" height="100" viewBox="0 0 150 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0)">
                    <path d="M2 64.5H148" stroke="black"/>
                    <path d="M99.5272 4.62856C95.568 4.69755 92.0921 8.90085 90.8437 13.6201C88.7368 21.5842 102.12 19.5056 104.56 29.647C107.61 42.3237 128.362 35.9507 131.749 27.4051C135.136 18.8595 125.834 12.6567 115.961 14.2432C106.087 15.8297 104.476 4.54232 99.5272 4.62856Z" stroke="#CFCFCF" stroke-width="2" stroke-dasharray="4 4"/>
                    <path d="M45 37H105L115 52H35L45 37Z" fill="#FF720D"/>
                    <g class="empty__illustration__tab2">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M58 19C55.7909 19 54 20.7909 54 23V57C54 59.2091 55.7909 61 58 61H98C100.209 61 102 59.2091 102 57V26H73V19H58Z" fill="#92EBFF"/>
                    </g>
                    <g class="empty__illustration__tab1">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M48 23C45.7909 23 44 24.7909 44 27V57C44 59.2091 45.7909 61 48 61H102C104.209 61 106 59.2091 106 57V30H63V23H48Z" fill="#5891FF"/>
                    <path d="M62 40.5L50.5 52H94.5L78.5 36L68 46.5L62 40.5Z" fill="white"/>
                    <circle cx="52" cy="36" r="4" fill="#FFB904"/>
                    </g>
                    <rect x="35" y="52" width="80" height="46" fill="#FFB904"/>
                    <path d="M63.5 64.5H86.5V66C86.5 67.933 84.933 69.5 83 69.5H67C65.067 69.5 63.5 67.933 63.5 66V64.5Z" stroke="black"/>
                    <path d="M2 46L6.375 28L23 40L2 46Z" fill="#CFCFCF"/>
                    <circle cx="134" cy="72" r="6" fill="#CFCFCF"/>
                    </g>
                    <defs>
                    <clipPath id="clip0">
                    <rect width="150" height="100" fill="white"/>
                    </clipPath>
                    </defs>
                </svg>                                      
            </figure>
            <h2 class="empty__title" data-msg="empty_title">It's quiet here.</h2>
        </div>
        {/if}
    </main>

    {#if tabGroups.length > 0}
    <ul class="actions" role="menu">
        <li class="actions__item" role="menuitem">
            <IconButton size="56px" ariaLabel="Remove Identical Tabs" on:click={removeIdentical}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 16L13 12V8.82C14.16 8.4 15 7.3 15 6C15 4.34 13.66 3 12 3C10.34 3 9 4.34 9 6C9 7.3 9.84 8.4 11 8.82V12L7 16H3V21H8V17.95L12 13.75L16 17.95V21H21V16H17Z" fill="var(--icon-ink)"/></svg>                    
            </IconButton>
        </li>
        <li class="actions__item" role="menuitem">
            <IconButton size="56px" ariaLabel="Merge All Groups" on:click={mergeAll}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.41 18.59L8.83 20L12 16.83L15.17 20L16.58 18.59L12 14L7.41 18.59ZM16.59 5.41L15.17 4L12 7.17L8.83 4L7.41 5.41L12 10L16.59 5.41Z" fill="var(--icon-ink)"/></svg>
            </IconButton>
        </li>
    </ul>
    {/if}
</div>