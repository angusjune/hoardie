<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    
    export let id;
    export let tabInfo;

    let favIconUrl = tabInfo.favIconUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTkgMS41QzQuODYgMS41IDEuNSA0Ljg2IDEuNSA5QzEuNSAxMy4xNCA0Ljg2IDE2LjUgOSAxNi41QzEzLjE0IDE2LjUgMTYuNSAxMy4xNCAxNi41IDlDMTYuNSA0Ljg2IDEzLjE0IDEuNSA5IDEuNVpNOC4yNSAxNC45NDc1QzUuMjg3NSAxNC41OCAzIDEyLjA2IDMgOUMzIDguNTM1IDMuMDYgOC4wOTI1IDMuMTU3NSA3LjY1NzVMNi43NSAxMS4yNVYxMkM2Ljc1IDEyLjgyNSA3LjQyNSAxMy41IDguMjUgMTMuNVYxNC45NDc1Wk0xMy40MjUgMTMuMDQyNUMxMy4yMyAxMi40MzUgMTIuNjc1IDEyIDEyIDEySDExLjI1VjkuNzVDMTEuMjUgOS4zMzc1IDEwLjkxMjUgOSAxMC41IDlINlY3LjVINy41QzcuOTEyNSA3LjUgOC4yNSA3LjE2MjUgOC4yNSA2Ljc1VjUuMjVIOS43NUMxMC41NzUgNS4yNSAxMS4yNSA0LjU3NSAxMS4yNSAzLjc1VjMuNDQyNUMxMy40NDc1IDQuMzM1IDE1IDYuNDg3NSAxNSA5QzE1IDEwLjU2IDE0LjQgMTEuOTc3NSAxMy40MjUgMTMuMDQyNVoiIGZpbGw9IiNDNEM0QzQiLz4KPC9zdmc+Cg==';
    let url = tabInfo.url;
    let iconalt;

    function onClick() {
        dispatch('message', {
            id: id,
            url: url,
        });
    }
</script>

<style>
    .tab-list {
        position: relative;
        width: 100%;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        width: 100%;
        padding-inline-start: 16px;
        padding-inline-end: 16px;
        padding-top: 12px;
        padding-bottom: 12px;
        color: #000;
        line-height: 18px;
        cursor: pointer;
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
</style>

<div class="tab-list" on:click={onClick}>
    <span class="tab-list__icon"><img src={favIconUrl} alt={iconalt} loading="lazy"/></span>
    <span class="tab-list__title"><slot></slot></span>
</div>