<script lang="ts">
    import { onMount } from "svelte";
    import { TaxonomyPlot, parseTaxonomy } from "../util/taxonomy";

    let taxonomyPlot: TaxonomyPlot;
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
    <div class="selected-taxon"></div>
</div>

<style>
    svg {
        border: 2px solid lightgray;
        border-radius: 5px;
        min-height: 750px;
    }
</style>
