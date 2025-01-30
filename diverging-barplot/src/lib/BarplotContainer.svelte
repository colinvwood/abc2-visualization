<script lang="ts">
    import Barplot from "./Barplot.svelte";
    import FilterContainer from "./FilterContainer.svelte";

    const { features } = $props();
</script>

<p>I am the container</p>

<Barplot {features} />
<FilterContainer {features} />

<style>
</style>
