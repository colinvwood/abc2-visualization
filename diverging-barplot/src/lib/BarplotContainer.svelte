<script lang="ts">
    import Barplot from "./Barplot.svelte";

    const { features } = $props();

    let s = $state(0);
</script>

<Barplot {features} />

<style>
</style>
