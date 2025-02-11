<script lang="ts">
    import FilterAdder from "./FilterAdder.svelte";
    import Filter from "./Filter.svelte";
    import features from "../state/features.svelte";
    import plot from "../util/plot";

    // rerender feature view when filters change
    $effect(() => {
        features.filters;
        features.render();
    });

    // filter adder state
    let showAdder = $state(false);
    const hide = () => {
        showAdder = false;
    };
</script>

<div class="controls-container">
    <div class="header-container">
        <p>Plot Controls</p>
    </div>
    <div class="bar-adjustor-container">
        <button onclick={() => plot.increaseBarThickness()}>
            Bar Thickness +
        </button>
        <button onclick={() => plot.decreaseBarThickness()}>
            Bar Thickness -
        </button>
    </div>

    <div class="header-container">
        <p>Filters</p>
    </div>

    <div class="filter-toggle">
        <button onclick={() => (showAdder = !showAdder)}>Add Filter</button>
    </div>

    {#if showAdder}
        <FilterAdder {hide} />
    {/if}

    {#each features.filters as filter}
        <Filter {filter} />
    {/each}
</div>

<style>
    .controls-container {
        grid-column: 3 / 4;
        grid-row: 2 / 3;

        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: stretch;
        padding: 10px;
    }

    .filter-toggle {
        display: flex;
        flex-direction: row;
        justify-content: center;
        margin-bottom: 15px;
    }

    .bar-adjustor-container {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        margin-bottom: 15px;
    }

    .header-container {
        display: flex;
        flex-direction: row;
        justify-content: center;
    }
    .header-container p {
        font-size: 18px;
        font-weight: bold;
    }
</style>
