<script lang="ts">
    import { slide } from "svelte/transition";
    import features from "../util/features";
    import plot from "../util/plot";

    const { taxonomyPlot, taxonomyFilters } = $props();

    let filterInfo = $state({
        type: "",
        value: "",
        percent: "",
    });

    let errorMessage = $state("");

    function handleFilter() {
        if (!filterInfo.type) {
            errorMessage = "Please enter an input for Filter by.";
            return;
        }
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

        if (filterInfo.type == "feature-count") {
            taxonomyFilters.addFeatureCountFilter(valueAsNumber);
            taxonomyFilters.applyFilters();
            taxonomyPlot.render(taxonomyPlot.root);

            features.render();
            plot.updateData(features.view);
        } else {
            // todo
            throw new Error("Unexpected taxonomy filter type.");
        }

        filterInfo = {
            type: "",
            value: "",
            percent: "",
        };
        errorMessage = "";
    }
</script>

<div id="container">
    <h1>Add a Filter</h1>
    <div>
        <label for="filter-type">Filter by:</label>
        <select
            name="filter-type"
            id="filter-type"
            bind:value={filterInfo.type}
        >
            <option value="feature-count">Feature count</option>
        </select>
    </div>
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
</style>
