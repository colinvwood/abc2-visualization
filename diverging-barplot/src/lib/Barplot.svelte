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
        plot.updatePlot(features.view);
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
    svg {
        border: 1px solid black;
    }
    button {
        display: block;
    }
</style>
