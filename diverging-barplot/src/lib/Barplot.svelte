<script lang="ts">
    import { onMount } from "svelte";
    import { drawPlot } from "../util/plot";

    const { features } = $props();

    features.viewVariable = "year";
    features.render();

    onMount(() => {
        drawPlot(features, 40);
    });
</script>

<p>Barplot below</p>
<svg></svg>

<style>
    svg {
        border: 1px solid black;
    }
</style>
