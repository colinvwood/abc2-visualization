<script lang="ts">
    import FilterAdder from "./FilterAdder.svelte";
    import Filter from "./Filter.svelte";
    import { FeatureRecords } from "../state/features.svelte";

    const { features } = $props();

    // map FeatureRecord filter state to Filter components

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
<FilterAdder {features} {isAdderVisible} {hideAdder} />

{#each features.filters as filter}
    <Filter {features} {filter} />
{/each}

<style></style>
