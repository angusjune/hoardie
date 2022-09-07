<div class="side-menu" role="menu">
    <slot />
</div>

<style lang="scss">
    .side-menu {
        position: fixed;
        bottom: 64px;
        right: 64px;
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
</style>