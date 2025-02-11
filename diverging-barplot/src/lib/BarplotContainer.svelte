<script lang="ts">
    import Barplot from "./Barplot.svelte";
    import FilterContainer from "./FilterContainer.svelte";
</script>

<div class="plot-container">
    <Barplot />
    <FilterContainer />
</div>

<style>
    .plot-container {
        display: grid;
        grid-template-columns: repeat(10, 10%);
    }
</style>
