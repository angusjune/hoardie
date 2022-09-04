<main class="container">
    <label class="switch">
        <span class="switch__label"><slot></slot></span>
        <input type="checkbox" class="switch__input" bind:checked={on} on:change={onChange}>
        <div class="switch__bar" role="switch" aria-checked={on}>
            <div class="switch__knob"></div>
        </div>
    </label>    
</main>

<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let on = false;

    function onChange(e) {
        dispatch('change', { ...e, checked: on });
    }
</script>

<style scoped lang="scss">
    @use 'base';
    @include base.core-styles();

    :global(body) {
        color: var(--primary);
        background: var(--surface);
    }

    .container {
        padding: 16px;
    }

    .switch {
        --knob-size: 1.2rem;
        --bar-width: 1.6rem;
        --bar-height: 0.8rem;

        display: flex;
        align-items: center;
        font-size: 16px;

        &__label {
            flex: 1;
            margin-right: 1rem;
        }

        &__input {
            display: none;
        }

        &__input:checked ~ .switch__bar {
            background-color: var(--switch-checked-bar-color);

            .switch__knob {
                background-color: var(--theme);
                transform: translateX(var(--bar-width));
            }
        }

        &__bar {
            position: relative;
            width: var(--bar-width);
            height: var(--bar-height);
            border-radius: calc(var(--bar-height) / 2);
            background-color: var(--switch-unchecked-bar-color);
            cursor: pointer;
            transition: background-color 0.2s ease-in-out;
        }

        &__knob {
            position:absolute;
            top: calc((var(--knob-size) - var(--bar-height)) / -2);
            left: calc(var(--knob-size) / -2);
            width: var(--knob-size);
            height: var(--knob-size);
            border-radius: 50%;
            background-color: var(--surface);
            box-shadow: rgba(0, 0, 0, 0.4) 0px 1px 3px 0px;
            transition: transform 0.2s ease-in-out;
        }
    }
</style>