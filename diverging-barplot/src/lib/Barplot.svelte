<script lang="ts">
    import { onMount } from "svelte";
    import features from "../state/features.svelte";
    import plot from "../util/plot";

    // render features
    features.viewVariable = "year";
    features.render();

    // draw plot once svg exists
    onMount(() => {
        plot.updateData(features.view);
        plot.drawPlot();
    });

    // rerender plot when feature view changes
    $effect(() => {
        plot.updateData(features.view);

        if (features.view.length > 0) {
            plot.showPlot();
            plot.updatePlot();
        } else {
            plot.hidePlot();
        }
    });
</script>

<div class="button-container">
    <button onclick={() => plot.increaseBarThickness()}>Bar Thickness +</button>
    <button onclick={() => plot.decreaseBarThickness()}>Bar Thickness -</button>
</div>

<svg></svg>

<style>
    svg {
        grid-column-start: 2;
        grid-column-end: 6;
    }
</style>
