<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let dataId;
    export let ariaLabel;
    export let dataMsg;
    export let size = '24px';
    export let message = {};
    export let hidden = false;
    export let stopPropagation = false;

    function onClick(e) {
        if (stopPropagation) {
            e.stopPropagation();
        }
        dispatch('click', e);
    }
</script>

<style lang="scss">
    .icon-btn {
        position: relative;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: none;
        background: none;
        padding: 0;

        &:before, &:after  {
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

        &:after  {
            transform: scale(0);
            transition: transform 0.12s;
            will-change: opacity, transform;
        }

        &:active:after  {
            transform: scale(1);
        }

        &__content {
            display: block;
            width: 100%;
            height: 100%;
        }
    }
</style>

<button on:click={onClick} class="icon-btn" aria-label={ariaLabel} data-msg={dataMsg} hidden={hidden} data-id={dataId}>
    <i class="icon-btn__content"><slot></slot></i>
</button>