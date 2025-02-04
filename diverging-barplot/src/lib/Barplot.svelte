<script lang="ts">
    import { onMount } from "svelte";
    import { DivergingBarplot } from "../util/plot";
    import features from "../state/features.svelte";

    // render features
    features.viewVariable = "year";
    features.render();

    // draw plot once svg exists
    let plot: DivergingBarplot;
    onMount(() => {
        plot = new DivergingBarplot(features.view);
    });

    // rerender plot when feature view changes
    $effect(() => {
        if (features.view.length > 0) {
            plot.showPlot();
            plot.updatePlot(features.view);
        } else {
            plot.hidePlot();
        }
    });

    const increaseBarThickness = () => {
        plot.dimensions.barHeight *= 1.05;
        plot.updatePlot(features.view);
    };
    const decreaseBarThickness = () => {
        plot.dimensions.barHeight *= 0.95;
        plot.updatePlot(features.view);
    };
</script>

<p>Barplot</p>

<button onclick={increaseBarThickness}>Bar Thickness +</button>
<button onclick={decreaseBarThickness}>Bar Thickness -</button>

<svg></svg>

<style>
    button {
        display: block;
    }
</style>
