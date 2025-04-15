<script lang="ts">
    import BarplotContainer from "./lib/BarplotContainer.svelte";
    import Taxonomy from "./lib/Taxonomy.svelte";
    import { parseAllSlices } from "./util/parse";
    import features from "./state/features.svelte";
    import { parseTaxonomy } from "./util/taxonomy.svelte";

    const slicesDirPath = "testing";

    const taxonomyPromise = parseTaxonomy("taxonomy.tsv");
    const featuresPromise = taxonomyPromise.then((rootTaxon) => {
        return parseAllSlices(slicesDirPath, features, rootTaxon.data);
    });
</script>

{#await featuresPromise}
    <p>Parsing slices...</p>
{:then features}
    <BarplotContainer />
{:catch error}
    <p>An error occurred: {error.message}</p>
{/await}

{#await taxonomyPromise}
    <p>Parsing taxonomy...</p>
{:then rootTaxon}
    <Taxonomy {rootTaxon} />
{:catch error}
    <p>An error occurred: {error.message}</p>
{/await}
