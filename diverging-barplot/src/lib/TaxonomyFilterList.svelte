<script lang="ts">
    import features from "../util/features.svelte";
    import plot from "../util/plot";
    import { TaxonomyNode } from "../util/taxonomy.svelte";
    import ControlContainer from "./ControlContainer.svelte";

    const { taxonomyPlot, taxonomyFilters } = $props();

    let hideFilteredTree = $state(false);
    let hideFilteredPlot = $state(false);
    let keepOnly = $state(false);

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

    function handleHideFilteredTree() {
        taxonomyPlot.hideFiltered = hideFilteredTree;
        taxonomyPlot.render(taxonomyPlot.root);
    }

    function handlehideFilteredPlot() {
        if (hideFilteredPlot && keepOnly) {
            hideFilteredPlot = false;
            alert(
                `Select only one of hiding filtered taxa and showing only
                kept taxa.`,
            );
        }

        if (hideFilteredPlot) {
            features.hideFiltered = true;
            features.render();

            plot.updateData(features.view);
        } else {
            features.hideFiltered = false;

            features.render();
            plot.updateData(features.view);
        }
    }

    function handleKeepOnly() {
        if (hideFilteredPlot && keepOnly) {
            keepOnly = false;
            alert(
                "Select only one of hiding filtered taxa and showing only \
                kept taxa.",
            );
        }

        if (keepOnly) {
            features.showOnlyKept = true;
            features.render();

            plot.updateData(features.view);
        } else {
            features.showOnlyKept = false;

            features.render();
            plot.updateData(features.view);
        }
    }
</script>

<ControlContainer title="Taxonomy Filters">
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
    <div class="flex gap-1 text-sm">
        <input
            type="checkbox"
            id="hide-filters"
            name="hide-filters"
            bind:checked={hideFilteredTree}
            onchange={handleHideFilteredTree}
        />
        <label for="hide-filters">Hide filtered taxa from tree</label>
    </div>
    <div class="flex gap-1 text-sm">
        <input
            type="checkbox"
            id="plot-sync"
            name="plot-sync"
            bind:checked={hideFilteredPlot}
            onchange={handlehideFilteredPlot}
        />
        <label for="plot-sync">Hide filtered taxa from plot</label>
    </div>
    <div class="flex gap-1 text-sm">
        <input
            type="checkbox"
            id="keep-only"
            name="keep-only"
            bind:checked={keepOnly}
            onchange={handleKeepOnly}
        />
        <label for="keep-only">Show only kept taxa in plot</label>
    </div>
</ControlContainer>

<style>
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
