<script>
    export let id = '';
    export let value = '';
    export let defaultValue = '';

    let  contentWidth = 0;

    $: if (value) {
        contentWidth = Math.max(value.length, defaultValue.length, 2);
    } else {
        contentWidth = defaultValue.length;
    }
</script>

<label class="et" class:et--empty={value.length < 1}>
    <h1 {id} class="et__title">{value || defaultValue}</h1>
    <input class="et__input" bind:value />
</label>

<style lang="scss">

    .et {
        position: relative;
        font-size: 24px;
        border-radius: 8px;
        min-height: 34px;
        width: fit-content;

        &:focus-within {
            .et__input {
                opacity: 1;
            }

            .et__title {
                opacity: 0
            }
        }

        &--empty:focus-within {
            .et__title {
                opacity: 1;
                opacity: 0.4;
            }
        }

        &__title, &__input {
            font-family: -apple-system, system-ui, sans-serif;
            font-size: 24px;
            line-height: 1.4;
            font-weight: 500;
            color: var(--primary);
            margin: 0;
            padding: 0;
            /* transition: opacity 0.2s ease; */
        }

        &__title {
            display: inline-flex;
        }

        &__input {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: transparent;
            border: 0;
            border-radius: 0;
            opacity: 0;

            &:focus {
                outline: 0;
            }
        }
    }
</style>