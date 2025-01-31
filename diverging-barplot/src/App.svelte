<script lang="ts">
    import BarplotContainer from "./lib/BarplotContainer.svelte";
    import { parseAllSlices } from "./util/parse";
    import features from "./state/features.svelte";

    const slicesDirPath = "testing";
    const parsePromise = parseAllSlices(slicesDirPath, features);
</script>

{#await parsePromise}
    <p>Parsing slices...</p>
{:then features}
    <BarplotContainer />
{:catch error}
    <p>An error occurred: {error.message}</p>
{/await}
