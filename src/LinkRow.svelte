<script>
    export let href = '#'

    function onClick() {
        chrome.tabs.create({ url: href })
    }
</script>

<div class="row">
    <label class="link" role="link" on:click={onClick}>
        <span class="link__label"><slot></slot></span>
    </label>
</div>

<style lang="scss">
    .row {
        &:hover {
            background: rgba(0,0,0,.05);
        }
    }

    .link {
        padding: 16px;
        display: flex;
        align-items: center;
        font-size: 16px;
        cursor: pointer;

        &__label {
            flex: 1;
            margin-right: 1rem;
        }
    }
</style>