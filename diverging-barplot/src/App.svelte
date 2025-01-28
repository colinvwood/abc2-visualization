<script lang="ts">
    import { parseAllSlices } from "./util/parse";
    import BarplotContainer from "./lib/Barplot.svelte";

    const slicesDirPath = "testing";
    const parsePromise = parseAllSlices(slicesDirPath);
</script>

{#await parsePromise}
    <p>Parsing slices...</p>
{:then features}
    <BarplotContainer {features} />
{:catch error}
    <p>An error occurred: {error.message}</p>
{/await}

<style>
</style>
