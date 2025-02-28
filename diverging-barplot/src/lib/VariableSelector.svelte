<script lang="ts">
    import features from "../state/features.svelte";

    const variables = features.getAllVariables();
    const uniqueVariableNames = Array.from(
        new Set(variables.map((v) => v.name)),
    );

    let variableName = $state("");
    let variableLevel = $state("");
    let showLevel = $state(false);
    let levelNames = $state<string[]>([]);

    const handleName = () => {
        const variables = features.getVariablesWithName(variableName);
        if (variables.length == 1) {
            // variable not categorical
            showLevel = false;
            variableLevel = "";

            features.viewVariable = variableName;
            features.viewVariableLevel = undefined;
            features.render();
        } else {
            // categorical variable
            showLevel = true;
            levelNames = variables.map((v) => v.level) as string[];
        }
    };
    const handleLevel = () => {
        // update features and render
        features.viewVariable = variableName;
        features.viewVariableLevel = variableLevel;
        features.render();
    };
</script>

<div class="variable-selector">
    <p>Variable Selector</p>
    <div class="variable-input">
        <label for="variable">Variable Name:</label>
        <select
            name="variable"
            id="variable"
            bind:value={variableName}
            onchange={handleName}
        >
            {#each uniqueVariableNames as name}
                <option value={name}>{name}</option>
            {/each}
        </select>
    </div>

    {#if showLevel}
        <div class="variable-input">
            <label for="level">Level:</label>
            <select
                name="level"
                id="level"
                bind:value={variableLevel}
                onchange={handleLevel}
            >
                {#each levelNames as name}
                    <option value={name}>{name}</option>
                {/each}
            </select>
        </div>
    {/if}
</div>

<style>
    .variable-selector {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
    }
    .variable-selector p {
        font-size: 20px;
        font-weight: bold;
    }

    .variable-input {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-bottom: 5px;
        width: 75%;
    }
    .variable-input select {
        width: 40%;
    }
</style>
