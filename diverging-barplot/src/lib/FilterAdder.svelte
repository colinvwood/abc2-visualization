<script lang="ts">
    import { slide } from "svelte/transition";

    let { features, isAdderVisible, hideAdder } = $props();

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
        hideAdder();
    }
</script>

{#if isAdderVisible}
    <div class="filter-adder" transition:slide={{ duration: 250 }}>
        <label for="slice">I want to filter features that have a</label>
        <select name="slice" id="slice" bind:value={filterInfo.slice}>
            <option value="lfc">lfc (log fold change)</option>
            <option value="se">se (standard error)</option>
            <option value="p">p-value</option>
            <option value="q">adjusted p-value (q)</option>
        </select>

        <label for="relationshiop">that is</label>
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

        <label for="value">than the number</label>
        <input
            type="text"
            id="value"
            name="value"
            bind:value={filterInfo.value}
        />

        <button onclick={addFilter}>Apply</button>

        {#if errorMessage}
            <p class="error-message">{errorMessage}</p>
        {/if}
    </div>
{/if}

<style>
    .error-message {
        color: red;
    }
</style>
