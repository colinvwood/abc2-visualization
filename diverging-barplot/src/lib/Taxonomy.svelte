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
        taxonomyPlot.render(null, root);
    });
</script>

<div class="taxonomy">
    <svg></svg>
</div>

<style>
</style>
