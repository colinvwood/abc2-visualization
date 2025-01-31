<script lang="ts">
    import FilterAdder from "./FilterAdder.svelte";
    import Filter from "./Filter.svelte";
    import features from "../state/features.svelte";

    // rerender feature view when filters change
    $effect(() => {
        features.filters;
        features.render();
    });

    // filter adder state
    let isAdderVisible = $state(false);
    const showAdder = () => {
        isAdderVisible = true;
    };
    const hideAdder = () => {
        isAdderVisible = false;
    };
</script>

<button onclick={showAdder}>Add Filter</button>
<FilterAdder {isAdderVisible} {hideAdder} />

{#each features.filters as filter}
    <Filter {filter} />
{/each}

<style></style>
