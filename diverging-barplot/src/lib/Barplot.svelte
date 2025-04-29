<script lang="ts">
    import { onMount } from "svelte";
    import BarplotControls from "./BarplotControls.svelte";
    import BarplotFilters from "./BarplotFilters.svelte";
    import features from "../util/features";
    import plot from "../util/plot";

    // render features
    features.viewVariable = "year";
    features.render();

    // draw plot once svg exists
    onMount(() => {
        plot.init(features.view);
        plot.drawPlot(false);
    });
</script>

<div class='grid grid-rows-subgrid row-span-2'>
    <div id="barplot-svg-container" class='grid grid-rows-subgrid bg-white rounded overflow-scroll'>
        <svg></svg>
    </div>
    <div id="sidebar" class='flex w-full min-w-0 gap-1'>
        <BarplotControls />
        <BarplotFilters />
    </div>
</div>

<style>
    svg {
        width: 100%;
        overflow: visible;
    }
</style>
