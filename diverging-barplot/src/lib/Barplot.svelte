<script lang="ts">
    import { onMount } from "svelte";
    import BarplotControls from "./BarplotControls.svelte";
    import BarplotFilters from "./BarplotFilters.svelte";
    import features from "../util/features.svelte";
    import plot from "../util/plot";

    // render features
    const initialVariable = features.getInitialVariable();
    features.viewVariable = initialVariable.name;
    if (initialVariable.level) {
        features.viewVariableLevel = initialVariable.level;
    }
    features.render();

    // draw plot once svg exists
    onMount(() => {
        plot.init(features.view);
        plot.drawPlot(false);
    });
</script>

<div id="container">
    <div id="barplot-svg-container">
        <svg></svg>
    </div>
    <div id="sidebar">
        <BarplotControls />
        <BarplotFilters />
    </div>
</div>

<style>
    #container {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        min-height: 500px;
        height: 50vh;
        width: 100%;
    }
    #barplot-svg-container {
        overflow: scroll;
        border: 2px solid lightgray;
        border-radius: 5px;
        height: 100%;
        width: 75%;
    }
    svg {
        width: 100%;
    }
    #sidebar {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        width: 23%;
    }
</style>
