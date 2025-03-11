<script lang="ts">
    const { selectedTaxon } = $props();

    const name = $derived(selectedTaxon ? selectedTaxon.name : "");
    const featureCount = $derived(selectedTaxon?.getFeatureCount() ?? "");
    const subtreeCount = $derived(
        selectedTaxon?.getSubtreeFeatureCount() ?? "",
    );
    const featureProportion = $derived(
        Math.round(
            (featureCount / selectedTaxon?.getTreeFeatureCount()) * 10_000,
        ) / 1_000,
    );
    const subtreeProportion = $derived(
        Math.round(
            (subtreeCount / selectedTaxon?.getTreeFeatureCount()) * 10_000,
        ) / 100,
    );
</script>

<div>
    <p>Name: {name}</p>
    <p>Features classified to taxon: {featureCount} ({featureProportion}%)</p>
    <p>Features classified to subtree: {subtreeCount} ({subtreeProportion}%)</p>
</div>

<style>
</style>
