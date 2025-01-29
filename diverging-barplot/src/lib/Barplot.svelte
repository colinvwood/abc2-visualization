<script lang="ts">
    import { onMount } from "svelte";
    import { DivergingBarplot } from "../util/plot";

    const { features } = $props();

    // render features
    features.viewVariable = "year";
    features.render();

    // draw plot once svg exists
    let plot: DivergingBarplot;
    onMount(() => {
        plot = new DivergingBarplot(features);
    });

    // rerender plot as needed
    // $effect(() => {
    //     plot.updatePlot(features);
    // });

    const increaseBarThickness = () => {
        plot.dimensions.barHeight *= 1.05;
        plot.updatePlot(features);
    };
    const decreaseBarThickness = () => {
        plot.dimensions.barHeight *= 0.95;
        plot.updatePlot(features);
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
