<script lang="ts">
    import features from "../util/features";
    import plot from "../util/plot";
    import ControlContainer from "./ControlContainer.svelte";

    const variables = features.getAllVariables();
    const uniqueVariableNames = Array.from(
        new Set(variables.map((v) => v.name)),
    );

    let variableName = $state("");
    let variableLevel = $state("");
    let showLevel = $state(false);
    let levelNames = $state<string[]>([]);

    function handleNameChange() {
        const variables = features.getVariablesWithName(variableName);

        if (variables.length == 1) {
            // variable not categorical
            showLevel = false;
            variableLevel = "";

            features.viewVariable = variableName;
            features.viewVariableLevel = null;

            features.render();
            plot.updateData(features.view);
        } else {
            // categorical variable
            showLevel = true;
            levelNames = variables.map((v) => v.level) as string[];
        }
    }

    function handleLevelChange() {
        // update features and render
        features.viewVariable = variableName;
        features.viewVariableLevel = variableLevel;

        features.render();
        plot.updateData(features.view);
    }
</script>

<ControlContainer title='Model Variable and Level:'>
    <div class='grid gap-x-2 grid-rows-3 grid-cols-[auto_1fr] place-items-baseline'>
        <div class="grid grid-cols-subgrid col-span-2">
            <label for="variable" class="col-end-1">Name:</label>
            <select
                name="variable"
                id="variable"
                class='bg-white border-gray-300 border rounded px-2 py-1 grow col-start-2 w-full'
                bind:value={variableName}
                onchange={handleNameChange}
            >
                {#each uniqueVariableNames as name}
                    <option value={name}>{name}</option>
                {/each}
            </select>
        </div>
        <div class="grid grid-cols-subgrid col-span-2">
            <label for="level" class='col-end-1'>Level:</label>
            <select
                name="level"
                id="level"
                class='bg-white border-gray-300 border rounded px-2 py-1 grow col-start-2 w-full'
                bind:value={variableLevel}
                onchange={handleLevelChange}
                disabled={!showLevel}
            >
                {#each levelNames as name}
                    <option value={name}>{name}</option>
                {/each}
            </select>
        </div>
        <div class="flex gap-4 col-span-2">
            <p class='col-end-1'>Bar Thickness:</p>
            <button class='aspect-square' onclick={() => plot.decreaseBarThickness()}>-</button>
            <button class='aspect-square' onclick={() => plot.increaseBarThickness()}>+</button>
        </div>
    </div>
</ControlContainer>
