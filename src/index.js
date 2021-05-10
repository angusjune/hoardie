'use strict';

const url = chrome.runtime.getURL('/index.html');
console.log(url);

chrome.storage.local.get(['tabs'], props => {
    console.log(props);
    const tabs = props.tabs;
    const list = document.querySelector('#list');

    tabs.forEach((el, i) => {
        if (el.url == chrome.runtime.getURL('/index.html')) {
            return;
        }
        const item = document.createElement('li');
        const itemContent = `<a data-url="${el.url}" data-id="${el.id}" data-pinned="${el.pinned}"><img src="${el.favIconUrl}">${el.title}</a>`;
        item.innerHTML = itemContent;

        item.addEventListener('click', () => {
            chrome.tabs.create({
                url: el.url,
                pinned: el.pinned,
                index: 1,
                active: false,
            }, async tab => {
                let remainingTabs = tabs;
                // remove reopened tab from the list
                remainingTabs.splice(remainingTabs.indexOf(tab), 1);

                console.log(remainingTabs);
                await chrome.storage.local.set({ tabs: remainingTabs });

                item.remove();
            });
        });

        list.append(item);
    });

});

