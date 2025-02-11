<script lang="ts">
    import { slide } from "svelte/transition";
    import features from "../state/features.svelte";

    let { hide } = $props();

    let filterInfo = $state({
        slice: "",
        relationship: "",
        value: "",
    });

    let errorMessage = $state("");

    function addFilter() {
        // handle errors
        if (!filterInfo.slice) {
            errorMessage = "Please enter a input for slice.";
            return;
        }
        if (!filterInfo.relationship) {
            errorMessage = "Please enter a input for the relationship.";
            return;
        }
        filterInfo.value = filterInfo.value.trim();
        if (!filterInfo.value) {
            errorMessage = "Please enter a input for the value.";
            return;
        }

        const valueAsNumber = parseFloat(filterInfo.value);
        if (isNaN(valueAsNumber)) {
            errorMessage =
                "Please enter a valid number as input for the value.";
            return;
        }

        // add filter to FeatureRecords instance
        features.addFilter(
            filterInfo.slice,
            filterInfo.relationship,
            valueAsNumber,
        );

        // clear local state
        errorMessage = "";
        filterInfo = {
            slice: "",
            relationship: "",
            value: "",
        };

        // hide ourselves
        hide();
    }
</script>

<div class="filter-adder" transition:slide={{ duration: 200 }}>
    <div class="filter-input">
        <label for="slice">Statistic:</label>
        <select name="slice" id="slice" bind:value={filterInfo.slice}>
            <option value="lfc">lfc (log fold change)</option>
            <option value="se">se (standard error)</option>
            <option value="p">p-value</option>
            <option value="q">adjusted p-value (q)</option>
        </select>
    </div>
    <div class="filter-input">
        <label for="relationshiop">Relationship:</label>
        <select
            name="relationship"
            id="relationship"
            bind:value={filterInfo.relationship}
        >
            <option value="gt">greater than</option>
            <option value="ge">greater than/equal</option>
            <option value="lt">less than</option>
            <option value="le">less than/equal</option>
        </select>
    </div>
    <div class="filter-input">
        <label for="value">Value:</label>
        <input
            type="text"
            id="value"
            name="value"
            bind:value={filterInfo.value}
        />
    </div>

    <button onclick={addFilter}>Apply</button>

    {#if errorMessage}
        <p class="error-message" transition:slide>{errorMessage}</p>
    {/if}
</div>

<style>
    .filter-adder {
        padding: 15px;
        background-color: lightblue;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: space-between;
        border-radius: 5px;
    }
    .filter-input {
        margin-bottom: 5px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }
    .filter-input select {
        min-width: 50px;
        max-width: 125px;
    }
    .filter-input input {
        min-width: 50px;
        max-width: 118px;
    }
    .error-message {
        color: red;
    }
</style>
