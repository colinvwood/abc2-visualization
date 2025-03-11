<script lang="ts">
    import { onMount } from "svelte";
    import SelectedTaxon from "./SelectedTaxon.svelte";
    import { TaxonomyPlot, parseTaxonomy } from "../util/taxonomy.svelte";

    let taxonomyPlot: TaxonomyPlot | null = null;
    onMount(async () => {
        // parse taxonomy
        const root = await parseTaxonomy("taxonomy.tsv");

        // create plot
        taxonomyPlot = new TaxonomyPlot(root);

        // draw plot
        taxonomyPlot.render(root);
    });
</script>

<div class="taxonomy">
    <svg></svg>
    <div class="taxonomy-controls">
        <div class="selected-taxon">
            <SelectedTaxon selectedTaxon={taxonomyPlot?.selectedTaxon} />
        </div>
        <div class="taxonomy-filter-controls"></div>
        <div class="taxonomy-filters"></div>
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

    .selected-taxon {
        width: 100%;
        height: 40%;
        border: 2px solid lightgray;
        border-radius: 5px;
    }
    .taxonomy-filter-controls {
        width: 100%;
        height: 28%;
        border: 2px solid lightgray;
        border-radius: 5px;
    }
    .taxonomy-filters {
        width: 100%;
        height: 28%;
        border: 2px solid lightgray;
        border-radius: 5px;
    }
</style>
