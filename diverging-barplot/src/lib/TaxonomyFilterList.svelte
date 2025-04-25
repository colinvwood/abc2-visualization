<script lang="ts">
    import features from "../util/features";
    import plot from "../util/plot";

    const { taxonomyPlot, taxonomyFilters } = $props();

    let plotSync = $state(false);
    let hideFiltered = $state(false);
    let keepOnly = $state(false);

    function removeFilter(type: string, value: string) {
        return () => {
            taxonomyFilters.removeFilter(type, value);
            taxonomyFilters.applyFilters();
            taxonomyPlot.render(taxonomyPlot.render);

            features.render();
            plot.updateData(features.view);
        };
    }

    function handleHideFiltered() {
        taxonomyPlot.hideFiltered = hideFiltered;
        taxonomyPlot.render(taxonomyPlot.root);
    }

    function handlePlotSync() {
        if (plotSync) {
            features.hideFiltered = true;
            features.render();

            plot.updateData(features.view);
        } else {
            features.hideFiltered = false;

            features.render();
            plot.updateData(features.view);
        }
    }

    function handleKeepOnly() {
        if (keepOnly) {
            features.rootTaxon = taxonomyPlot.root.data;
            features.showOnlyKept = true;
            features.render();

            plot.updateData(features.view);
        } else {
            features.rootTaxon = null;
            features.showOnlyKept = false;

            features.render();
            plot.updateData(features.view);
        }
    }
</script>

<div id="container">
    <h1>Filters</h1>
    <div id="filters">
        {#each taxonomyFilters?.filters as filter}
            <div class="filter">
                <p>{filter.type} {"<"} {filter.value}</p>
                <button onclick={removeFilter(filter.type, filter.value)}>
                    Remove
                </button>
            </div>
        {/each}
    </div>
    <div class="toggle">
        <label for="plot-sync">Hide filtered taxa from tree</label>
        <input
            type="checkbox"
            id="hide-filters"
            name="hide-filters"
            bind:checked={hideFiltered}
            onchange={handleHideFiltered}
        />
    </div>
    <div class="toggle">
        <label for="plot-sync">Hide filtered taxa from barplot</label>
        <input
            type="checkbox"
            id="plot-sync"
            name="plot-sync"
            bind:checked={plotSync}
            onchange={handlePlotSync}
        />
    </div>
    <div class="toggle">
        <label for="keep-only">Show only kept taxa in barplot</label>
        <input
            type="checkbox"
            id="keep-only"
            name="keep-only"
            bind:checked={keepOnly}
            onchange={handleKeepOnly}
        />
    </div>
</div>

<style>
    #container {
        width: 100%;
        height: 32%;
        border: 2px solid lightgray;
        border-radius: 5px;

        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
    }
    h1 {
        margin: 0;
        padding: 0;
        font-size: 16px;
    }
    .filter {
        background-color: #fca9a9;
        border-radius: 5px;
        padding: 6px;
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        width: 80%;
        margin-bottom: 5px;
    }
    p {
        margin: 0;
        padding: 0;
    }
    #filters {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        overflow: scroll;
    }
    .toggle {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
    }
    input {
        border: 4px solid lightgray;
        border-radius: 2px;
    }
</style>
