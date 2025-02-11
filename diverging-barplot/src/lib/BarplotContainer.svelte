<script lang="ts">
    import { onMount } from "svelte";
    import Barplot from "./Barplot.svelte";
    import BarplotControls from "./BarplotControls.svelte";
    import features from "../state/features.svelte";

    // render features and create plot
    features.viewVariable = "year";
    features.render();
</script>

<div class="barplot-container">
    <Barplot />
    <BarplotControls />
</div>

<style>
    .barplot-container {
        display: grid;
        grid-template-columns: 10% 60% 20% 10%;
        grid-template-rows: 10% 80% 10%;
        gap: 10px;
    }
</style>
