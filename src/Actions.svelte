<script>
    import { createEventDispatcher } from 'svelte';
    import IconButton from './IconButton.svelte';

    const dispatch = createEventDispatcher();
</script>

<ul class="actions" role="menu">
    <li class="actions__item" role="menuitem">
        <IconButton size="56px" ariaLabel="Remove Identical Tabs" on:click={()=>dispatch('removeIdentical')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 16L13 12V8.82C14.16 8.4 15 7.3 15 6C15 4.34 13.66 3 12 3C10.34 3 9 4.34 9 6C9 7.3 9.84 8.4 11 8.82V12L7 16H3V21H8V17.95L12 13.75L16 17.95V21H21V16H17Z" fill="var(--icon-ink)"/></svg>                    
        </IconButton>
    </li>
    <li class="actions__item" role="menuitem" style="display:var(--merge-display)">
        <IconButton size="56px" ariaLabel="Merge All Groups" on:click={()=>dispatch('mergeAll')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.41 18.59L8.83 20L12 16.83L15.17 20L16.58 18.59L12 14L7.41 18.59ZM16.59 5.41L15.17 4L12 7.17L8.83 4L7.41 5.41L12 10L16.59 5.41Z" fill="var(--icon-ink)"/></svg>
        </IconButton>
    </li>
</ul>

<style lang="scss">
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

            @media screen and (max-width: 900px) {
                box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.2);
            }
        }
    }
</style>