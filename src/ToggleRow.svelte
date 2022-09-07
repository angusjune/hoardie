<div class="row">
    <label class="toggle">
        <span class="toggle__label"><slot></slot></span>
        <input type="checkbox" class="toggle__input" bind:checked={on} on:change={onChange}>
        <div class="toggle__track" role="button" aria-pressed={on}>
            <div class="toggle__knob"></div>
        </div>
    </label>
</div>

<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let on = false;

    function onChange(e) {
        dispatch('change', { ...e, checked: on });
    }
</script>

<style scoped lang="scss">
    .row {
        padding: 16px;
    }

    .toggle {
        --knob-size: 1.2rem;
        --track-width: 1.6rem;
        --track-height: 0.8rem;

        display: flex;
        align-items: center;
        font-size: 16px;
        cursor: pointer;

        &__label {
            flex: 1;
            margin-right: 1rem;
        }

        &__input {
            display: none;
        }

        &__input:checked ~ .toggle__track {
            background-color: var(--toggle-track-on-color);

            .toggle__knob {
                background-color: var(--toggle-knob-on-color);
                transform: translateX(var(--track-width));
            }
        }

        &__track {
            position: relative;
            width: var(--track-width);
            height: var(--track-height);
            border-radius: calc(var(--track-height) / 2);
            background-color: var(--toggle-track-off-color);
            cursor: pointer;
            transition: background-color 0.2s ease-in-out;
        }

        &__knob {
            position:absolute;
            top: calc((var(--knob-size) - var(--track-height)) / -2);
            left: calc(var(--knob-size) / -2);
            width: var(--knob-size);
            height: var(--knob-size);
            border-radius: 50%;
            background-color: var(--toggle-knob-off-color);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
            transition: transform 0.2s ease-in-out;
        }
    }
</style>