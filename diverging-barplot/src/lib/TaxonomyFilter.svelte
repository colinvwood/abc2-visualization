<script lang="ts">
    import { slide } from "svelte/transition";
    import features from "../util/features.svelte";
    import plot from "../util/plot";
    import ControlContainer from "./ControlContainer.svelte";

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

<ControlContainer title="Filter Taxonomy by Feature:">
    <div class="grid grid-cols-[auto_1fr] gap-4">
        <div class="grid grid-cols-subgrid col-span-2">
            <label for="filter-value">Value:</label>
            <input
                type="text"
                id="filter-value"
                name="value"
                class="bg-white border-gray-300 border rounded px-2 py-1 grow col-start-2 w-full"
                bind:value={filterInfo.value}
            />
        </div>
        <div class="grid grid-cols-subgrid col-span-2">
            <label for="filter-percent">Percentage:</label>
            <input
                type="text"
                id="filter-percent"
                name="filter-percent"
                class="bg-white border-gray-300 border rounded px-2 py-1 grow col-start-2 w-full"
                bind:value={filterInfo.percent}
            />
        </div>
        <button onclick={handleFilter} class="col-span-2 w-min">Apply</button>
    </div>

    {#if errorMessage != ""}
        <div id="error-message" transition:slide>
            <p>{errorMessage}</p>
        </div>
    {/if}
</ControlContainer>

<style>
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
