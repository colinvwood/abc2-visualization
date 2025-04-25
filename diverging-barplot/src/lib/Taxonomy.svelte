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

<div id="container">
    <div id="taxonomy-svg-container">
        <svg></svg>
    </div>
    <div id="sidebar">
        <SelectedTaxon {taxonomyPlot} {taxonomyFilters} />
        <TaxonomyFilter {taxonomyPlot} {taxonomyFilters} />
        <TaxonomyFilterList {taxonomyPlot} {taxonomyFilters} />
    </div>
</div>

<style>
    #container {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        min-height: 500px;
        height: 50vh;
        width: 100%;
    }
    #taxonomy-svg-container {
        width: 75%;
        border: 2px solid lightgray;
        border-radius: 5px;
    }
    svg {
        width: 100%;
        height: 100%;
    }
    #sidebar {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        width: 23%;
    }
</style>
