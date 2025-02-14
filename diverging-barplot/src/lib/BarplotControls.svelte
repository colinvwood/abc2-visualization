<script lang="ts">
    import Filters from "./Filters.svelte";
    import VariableSelector from "./VariableSelector.svelte";
    import features from "../state/features.svelte";
    import plot from "../util/plot";

    // rerender feature view when filters change
    $effect(() => {
        features.filters;
        features.render();
    });
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

    <VariableSelector />

    <Filters />
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

    .bar-adjustor-container {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        margin-bottom: 15px;
    }
</style>
