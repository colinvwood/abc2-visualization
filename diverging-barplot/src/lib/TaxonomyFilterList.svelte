<script lang="ts">
    import features from "../util/features.svelte";
    import plot from "../util/plot";
    import { TaxonomyNode } from "../util/taxonomy.svelte";

    const { taxonomyPlot, taxonomyFilters } = $props();

    function removeFilter(type: string, value?: string, node?: TaxonomyNode) {
        return () => {
            if (type == "feature-count") {
                taxonomyFilters.removeFeatureCountFilter(value);
            } else if (type == "individual") {
                taxonomyFilters.removeIndividualFilter(node);
            }
            taxonomyFilters.applyFilters();
            taxonomyPlot.render(taxonomyPlot.render);

            features.render();
            plot.updateData(features.view);
        };
    }
</script>

<div id="container">
    <h1>Taxonomy Filters</h1>
    <div id="filters">
        {#each taxonomyFilters?.filters as filter}
            <div class="filter">
                {#if filter.type == "feature-count"}
                    <p>features {"<"} {filter.value}</p>
                    <button onclick={removeFilter(filter.type, filter.value)}>
                        Remove
                    </button>
                {:else if filter.type == "individual"}
                    <p>
                        individual filter of
                        {filter.node.getNonAnonymousTaxonString()}
                    </p>
                    <button
                        onclick={removeFilter(
                            filter.type,
                            undefined,
                            filter.node,
                        )}
                    >
                        Remove
                    </button>
                {/if}
            </div>
        {/each}
    </div>
</div>

<style>
    #container {
        width: 100%;
        height: 22%;
        border: 2px solid lightgray;
        border-radius: 5px;

        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
    }
    h1 {
        margin: 0;
        padding: 6px 0px;
        font-size: 16px;
    }
    .filter {
        background-color: #fca9a9;
        border-radius: 5px;
        padding: 8px 2px;
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        width: 80%;
        margin-bottom: 5px;
    }
    p {
        margin: 0;
        padding: 0;
    }
    #filters {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        overflow: scroll;
    }
</style>
