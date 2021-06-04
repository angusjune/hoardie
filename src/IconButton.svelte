<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let dataId;
    export let ariaLabel;
    export let dataMsg;
    export let size = '24px';
    export let hidden = false;
    export let stopPropagation = false;

    document.documentElement.style.setProperty('--size', size);

    function onClick(e) {
        if (stopPropagation) {
            e.stopPropagation();
        }
        dispatch('click', e);
    }

    function onKeyDown(e) {
        if (stopPropagation) {
            e.stopPropagation();
        }
        dispatch('keydown', e);
    }
</script>

<style lang="scss">
    .icon-btn {
        --size: 24px;

        position: relative;
        width: var(--size);
        height: var(--size);
        border-radius: 50%;
        border: none;
        background: none;
        padding: 0;

        &:focus {
            outline: 0;
        }

        &:before, &:after  {
            --ripple-size: calc(var(--size) * 1.5);

            position: absolute;
            top: calc(var(--size) / -4);
            left: calc(var(--size) / -4);
            content: '';
            width: var(--ripple-size);
            height: var(--ripple-size);
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

        &:active:after, &:focus:after {
            transform: scale(1);
        }

        &:focus:after {
            background-color: var(--theme-secondary);
        }

        &__content {
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
</style>

<button on:click={onClick} on:keydown={onKeyDown} class="icon-btn {$$props.class}" title={ariaLabel} aria-label={ariaLabel} data-msg={dataMsg} hidden={hidden} data-id={dataId} style="--size:{size};">
    <i class="icon-btn__content"><slot></slot></i>
</button>