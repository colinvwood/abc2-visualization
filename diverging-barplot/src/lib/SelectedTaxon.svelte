<script lang="ts">
    import { slide } from "svelte/transition";
    import features from "../util/features.svelte";
    import plot from "../util/plot";

    const { taxonomyPlot, taxonomyFilters } = $props();

    let filtered = $state(false);
    $effect(() => {
        taxonomyFilters?.filters;

        if (taxonomyPlot != null && taxonomyPlot.selectedTaxon != null) {
            filtered = taxonomyPlot.selectedTaxon.filtered;
        }
    });

    const name = $derived(
        taxonomyPlot.selectedTaxon ? taxonomyPlot.selectedTaxon.name : "",
    );
    const featureCount = $derived(
        taxonomyPlot.selectedTaxon?.getFeatureCount() ?? "",
    );
    const subtreeCount = $derived(
        taxonomyPlot.selectedTaxon?.getSubtreeFeatureCount() ?? "",
    );
    const featurePercent = $derived(
        Math.round(
            (featureCount / taxonomyPlot.selectedTaxon?.getTreeFeatureCount()) *
                10_000,
        ) / 100,
    );
    const subtreePercent = $derived(
        Math.round(
            (subtreeCount / taxonomyPlot.selectedTaxon?.getTreeFeatureCount()) *
                10_000,
        ) / 100,
    );

    let searchString: string = $state("");
    let searchError: string = $state("");

    function handleSearch(event: KeyboardEvent) {
        if (event.key != "Enter") return;
        if (searchString == "") return;

        searchString = searchString.trim();

        const matches = taxonomyPlot.root.data.findTaxa(searchString);

        if (matches.length == 0) {
            searchError = "No matches found!";
            return;
        }
        if (matches.length > 10) {
            searchError = "More than 10 matches! Try a more specific search.";
            return;
        }

        searchError = "";

        taxonomyPlot.selectedTaxon = matches[0];

        for (let match of matches) {
            match.searchMatch = true;
        }
        taxonomyPlot.render(taxonomyPlot.root);
    }

    function clearSearch() {
        searchString = "";
        searchError = "";
        taxonomyPlot.root.data.clearSearchMatches();
        taxonomyPlot.render(taxonomyPlot.root);
    }

    function handleFilter() {
        if (filtered) {
            taxonomyFilters.addIndividualFilter(taxonomyPlot.selectedTaxon);
        } else {
            taxonomyFilters.removeIndividualFilter(taxonomyPlot.selectedTaxon);
        }

        taxonomyFilters.applyFilters();
        taxonomyPlot.render(taxonomyPlot.root);

        features.render();
        plot.updateData(features.view);
    }
</script>

<div id="container">
    <h1>Taxon Info</h1>
    <div id="search-bar">
        <input
            type="text"
            name="taxon"
            placeholder="Search..."
            bind:value={searchString}
            onkeydown={handleSearch}
        />
        <button onclick={clearSearch}>Clear</button>
    </div>
    {#if searchError != ""}
        <div id="search-error" transition:slide>
            <p>{searchError}</p>
        </div>
    {/if}
    {#if taxonomyPlot?.selectedTaxon == undefined}
        {#if searchError == ""}
            <p>Click on a taxon name for more information.</p>
        {/if}
    {:else}
        <p>Name: {name}</p>
        <p>
            Features classified to taxon: {featureCount} ({featurePercent}%)
        </p>
        <p>
            Features classified to subtree: {subtreeCount} ({subtreePercent}%)
        </p>
        <div class="toggle">
            <label for="taxon-filter">Filter:</label>
            <input
                type="checkbox"
                id="taxon-filter"
                name="taxon-filter"
                bind:checked={filtered}
                onchange={handleFilter}
            />
        </div>
    {/if}
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
    #search-bar {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }
    input {
        width: 75%;
        border: 2px solid lightgray;
        border-radius: 5px;
    }
    p {
        margin: 0;
        padding: 0;
        padding-right: 3%;
        padding-left: 3%;
    }
    #search-error {
        background-color: #fca9a9;
        border-radius: 5px;
        padding: 3px;
        max-width: 90%;
    }
    .toggle {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
    }
</style>
