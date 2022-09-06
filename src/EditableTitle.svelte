<script>
    export let id = '';
    export let value = '';
    export let defaultValue = '';

    let minWidth = 0;
    $: minWidth = defaultValue.length;
</script>

<div class="et" class:et--empty={value.length < 1}>
    <h1 {id} contenteditable role="textbox" class="et__input" style:--min-width={minWidth+'ch'} data-placeholder={defaultValue} on:input={e=>value=e.target.innerText} />
</div>

<style lang="scss">

    .et {
        --font-size: 24px;
        --line-height: 28px;

        position: relative;
        min-height: var(--line-height);
        width: fit-content;

        &:focus-within {
            .et__input:empty::before {
                opacity: 0.4;
            }
        }

        &__input {
            display: block;
            font-family: -apple-system, system-ui, sans-serif;
            font-size: var(--font-size);
            line-height: var(--line-height);
            font-weight: 500;
            width: 100%;
            min-height: var(--line-height);
            min-width: var(--min-width, 100px);
            color: var(--primary);
            margin: 0;
            padding: 0;
            word-break: break-all;
            position: relative;
            background: transparent;
            border: 0;
            border-radius: 0;
            overflow: hidden;
            resize: none;

            &:focus {
                outline: 0;
            }

            &:empty::before {
                content: attr(data-placeholder);
                transition: opacity 0.2s ease;
            }
        }
    }
</style>