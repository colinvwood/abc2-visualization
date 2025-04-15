<script lang="ts">
    const { taxonomyPlot, taxonomyFilters } = $props();

    let plotSync = $state(false);
    let hideFiltered = $state(false);

    function removeFilter(type: string, value: string) {
        return () => {
            taxonomyFilters.removeFilter(type, value);
            taxonomyFilters.applyFilters();
            taxonomyPlot.render(taxonomyPlot.render);
        };
    }

    function handlePlotSync() {
        // todo
        return;
    }

    function handleHideFiltered() {
        taxonomyPlot.hideFiltered = hideFiltered;
        taxonomyPlot.render(taxonomyPlot.root);
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
        <label for="plot-sync">Sync with bar plot</label>
        <input
            type="checkbox"
            id="plot-sync"
            name="plot-sync"
            bind:checked={plotSync}
            onchange={handlePlotSync}
        />
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
