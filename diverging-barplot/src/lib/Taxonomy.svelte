<script lang="ts">
    import { onMount } from "svelte";
    import SelectedTaxon from "./SelectedTaxon.svelte";
    import TaxonomyFilter from "./TaxonomyFilter.svelte";
    import TaxonomyFilterList from "./TaxonomyFilterList.svelte";
    import { TaxonomyPlot, TaxonomyFilters } from "../util/taxonomy.svelte";

    const { rootTaxon } = $props();

    let taxonomyPlot: TaxonomyPlot | null = $state(null);
    let taxonomyFilters: TaxonomyFilters | null = $state(null);

    onMount(() => {
        taxonomyPlot = new TaxonomyPlot(rootTaxon);
        taxonomyPlot.render(rootTaxon);

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
