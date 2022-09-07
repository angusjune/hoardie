<script>
    import { createEventDispatcher } from 'svelte';
    import IconButton from './IconButton.svelte';

    const dispatch = createEventDispatcher();

    export let ariaLabel;
</script>

<div class="side-menu-item" role="menuitem">
    <IconButton size="56px" {ariaLabel} on:click>
        <slot />
    </IconButton>
</div>

<style lang="scss" scoped>
    .side-menu-item {
        // width: 56px;
        // height: 56px;
        border-radius: 50%;
        overflow: hidden;
        background: var(--surface);
        box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);

        @media screen and (max-width: 900px) {
            box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.2);
        }
    }
</style>