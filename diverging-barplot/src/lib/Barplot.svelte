<script lang="ts">
    import { onMount } from "svelte";
    import { drawPlot, redrawPlot } from "../util/plot";

    const { features } = $props();

    let barThickness = $state(45);

    // render features
    features.viewVariable = "year";
    features.render();

    // draw plot once svg exists
    onMount(() => {
        drawPlot(features, barThickness);
    });

    // rerender plot as needed
    $effect(() => {
        redrawPlot(features, barThickness);
    });
</script>

<p>Barplot</p>

<button onclick={() => (barThickness *= 1.05)}>Bar Thickness +</button>
<button onclick={() => (barThickness *= 0.95)}>Bar Thickness -</button>

<svg></svg>

<style>
    svg {
        border: 1px solid black;
    }
    button {
        display: block;
    }
</style>
