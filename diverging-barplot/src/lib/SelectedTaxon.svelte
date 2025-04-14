<script lang="ts">
    import { slide } from "svelte/transition";

    const { taxonomyPlot } = $props();

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

        searchString = searchString.trim();

        if (searchString == "") {
            searchError = "";
            return;
        }

        const matches = taxonomyPlot.root.data.findTaxa(searchString);

        if (matches.length == 0) {
            searchError = "No matches found!";
            return;
        }
        if (matches.length > 5) {
            searchError = "More than 5 matches! Try a more specific search.";
            return;
        }

        searchError = "";

        for (let match of matches) {
            match.hierarchyNode.keep = true;
        }
        taxonomyPlot.render(taxonomyPlot.root);
    }
</script>

<div class="container">
    <input
        type="text"
        name="taxon"
        placeholder="Search..."
        bind:value={searchString}
        onkeydown={handleSearch}
    />
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
    {/if}
</div>

<style>
    .container {
        width: 100%;
        height: 30%;
        border: 2px solid lightgray;
        border-radius: 5px;

        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
    }

    .container input {
        width: 80%;
        border: 2px solid lightgray;
        border-radius: 5px;
    }

    .container p {
        margin: 0;
        padding: 0;
        padding-right: 3%;
        padding-left: 3%;
    }

    #search-error {
        background-color: #fca9a9;
        border-radius: 5px;
        padding: 3px;
    }
</style>
