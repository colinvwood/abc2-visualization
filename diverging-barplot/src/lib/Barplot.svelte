<script lang="ts">
    import { onMount } from "svelte";
    import features from "../state/features.svelte";
    import plot from "../util/plot";

    // render features
    features.viewVariable = "year";
    features.render();

    // draw plot once svg exists
    onMount(() => {
        plot.init(features.view);
        plot.drawPlot(false);
    });

    // rerender plot when feature view changes
    $effect(() => {
        plot.updateData(features.view);

        if (features.view.length > 0) {
            plot.showPlot();
            plot.drawPlot(true);
        } else {
            plot.hidePlot();
        }
    });
</script>

<div class="svg-container">
    <svg></svg>
</div>

<style>
    .svg-container {
        grid-column: 2 / 3;
        grid-row: 2 / 3;
    }
    svg {
        width: 100%;
    }
</style>
