<script lang="ts">
    import { onMount } from "svelte";
    import SelectedTaxon from "./SelectedTaxon.svelte";
    import TaxonomyFilter from "./TaxonomyFilter.svelte";
    import TaxonomyFilterList from "./TaxonomyFilterList.svelte";
    import {
        TaxonomyPlot,
        TaxonomyFilters,
        parseTaxonomy,
    } from "../util/taxonomy.svelte";

    let taxonomyPlot: TaxonomyPlot | null = null;
    let taxonomyFilters: TaxonomyFilters | null = null;
    onMount(async () => {
        const root = await parseTaxonomy("taxonomy-big.tsv");
        taxonomyPlot = new TaxonomyPlot(root);
        taxonomyPlot.render(root);

        taxonomyFilters = new TaxonomyFilters(taxonomyPlot.root.data);
    });
</script>

<div class="taxonomy">
    <svg></svg>
    <div class="taxonomy-controls">
        <SelectedTaxon {taxonomyPlot} />
        <TaxonomyFilter {taxonomyPlot} {taxonomyFilters} />
        <TaxonomyFilterList {taxonomyPlot} {taxonomyFilters} />
    </div>
</div>

<style>
    .taxonomy {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
    }
    svg {
        height: 70vh;
        width: 80vw;
        border: 2px solid lightgray;
        border-radius: 5px;
    }
    .taxonomy-controls {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        width: 18vw;
    }
</style>
