<script lang="ts">
    import { slide } from "svelte/transition";
    import features from "../util/features.svelte";
    import plot from "../util/plot";

    const { taxonomyPlot, taxonomyFilters } = $props();

    let filterInfo = $state({
        value: "",
        percent: "",
    });

    let hideFilteredTree = $state(false);
    let hideFilteredPlot = $state(false);
    let keepOnly = $state(false);

    let errorMessage = $state("");

    function handleFilter() {
        if (filterInfo.value == "" && filterInfo.percent == "") {
            errorMessage =
                "Please enter an input for either Value or Percentage.";
            return;
        }
        if (filterInfo.value != "" && filterInfo.percent != "") {
            errorMessage =
                "Please enter an input for only one of Value, Percentage.";
            return;
        }

        let valueAsNumber;
        if (filterInfo.value != "") {
            valueAsNumber = parseFloat(filterInfo.value);
        } else {
            valueAsNumber = parseFloat(filterInfo.percent);
        }
        if (isNaN(valueAsNumber)) {
            errorMessage = "Please enter a valid number.";
            return;
        }

        if (filterInfo.percent != "") {
            // convert to absolute count
            const numberFeatures = taxonomyPlot.root.data.getTreeFeatureCount();
            valueAsNumber = (valueAsNumber / 100) * numberFeatures;
        }

        taxonomyFilters.addFeatureCountFilter(valueAsNumber);
        taxonomyFilters.applyFilters();
        taxonomyPlot.render(taxonomyPlot.root);

        features.render();
        plot.updateData(features.view);

        filterInfo = {
            value: "",
            percent: "",
        };
        errorMessage = "";
    }

    function handleHideFilteredTree() {
        taxonomyPlot.hideFiltered = hideFilteredTree;
        taxonomyPlot.render(taxonomyPlot.root);
    }

    function handlehideFilteredPlot() {
        if (hideFilteredPlot && keepOnly) {
            hideFilteredPlot = false;
            alert(
                `Select only one of hiding filtered taxa and showing only
                kept taxa.`,
            );
        }

        if (hideFilteredPlot) {
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
        if (hideFilteredPlot && keepOnly) {
            keepOnly = false;
            alert(
                "Select only one of hiding filtered taxa and showing only \
                kept taxa.",
            );
        }

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
    <h1>Filter Taxonomy by Feature Count</h1>
    <div>
        <label for="filter-value">Value:</label>
        <input
            type="text"
            id="filter-value"
            name="value"
            bind:value={filterInfo.value}
        />
    </div>
    <div>
        <label for="filter-percent">Percentage:</label>
        <input
            type="text"
            id="filter-percent"
            name="filter-percent"
            bind:value={filterInfo.percent}
        />
    </div>
    <button onclick={handleFilter}>Apply</button>

    {#if errorMessage != ""}
        <div id="error-message" transition:slide>
            <p>{errorMessage}</p>
        </div>
    {/if}
    <div class="toggle">
        <label for="plot-sync">Hide filtered taxa from tree</label>
        <input
            type="checkbox"
            id="hide-filters"
            name="hide-filters"
            bind:checked={hideFilteredTree}
            onchange={handleHideFilteredTree}
        />
    </div>
    <div class="toggle">
        <label for="plot-sync">Hide filtered taxa from barplot</label>
        <input
            type="checkbox"
            id="plot-sync"
            name="plot-sync"
            bind:checked={hideFilteredPlot}
            onchange={handlehideFilteredPlot}
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
        height: 40%;
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
    input {
        border: 2px solid lightgray;
        border-radius: 5px;
    }
    #error-message {
        background-color: #fca9a9;
        border-radius: 5px;
        padding: 5px;
        max-width: 90%;
    }
    p {
        padding: 0;
        margin: 0;
    }
    .toggle {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
    }
    input {
        border: 2px solid lightgray;
        border-radius: 5px;
    }
</style>
