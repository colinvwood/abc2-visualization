<script lang="ts">
    const { selectedTaxon } = $props();
</script>

<div>
    <p>Name: {selectedTaxon ? selectedTaxon.name : ""}</p>
    <p>
        Features classified here:
        {selectedTaxon ? selectedTaxon.featureIDs.length : ""}
    </p>
</div>

<style>
</style>
