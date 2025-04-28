<script lang="ts">
    import features from "../util/features.svelte";
    import plot from "../util/plot";

    const variables = features.getAllVariables();
    const uniqueVariableNames = Array.from(
        new Set(variables.map((v) => v.name)),
    );

    let levelNames = $derived<(string | undefined)[]>(
        features
            .getVariablesWithName(features.viewVariable)
            .map((v) => v.level),
    );
    let showLevel = $derived(levelNames.length > 1);

    function handleNameChange() {
        const variables = features.getVariablesWithName(features.viewVariable);

        if (variables.length == 1) {
            // variable not categorical
            features.viewVariableLevel = "";

            features.render();
            plot.updateData(features.view);
        }
    }

    function handleLevelChange() {
        // update features and render
        features.render();
        plot.updateData(features.view);
    }
</script>

<div id="container">
    <div id="variable-selector">
        <h1>Model Variable and Level:</h1>
        <div class="variable-input">
            <label for="variable">Name:</label>
            <select
                name="variable"
                id="variable"
                bind:value={features.viewVariable}
                onchange={handleNameChange}
            >
                {#each uniqueVariableNames as name}
                    <option value={name}>{name}</option>
                {/each}
            </select>
        </div>
        <div class="variable-input">
            <label for="level">Level:</label>
            <select
                name="level"
                id="level"
                bind:value={features.viewVariableLevel}
                onchange={handleLevelChange}
                disabled={!showLevel}
            >
                {#each levelNames as name}
                    <option value={name}>{name}</option>
                {/each}
            </select>
        </div>
    </div>
    <div id="bar-adjustors">
        <p>Bar Thickness</p>
        <button onclick={() => plot.decreaseBarThickness()}>-</button>
        <button onclick={() => plot.increaseBarThickness()}>+</button>
    </div>
</div>

<style>
    #container {
        width: 100%;
        height: 35%;
        border: 2px solid lightgray;
        border-radius: 5px;

        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
    }
    #bar-adjustors {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }
    #bar-adjustors p {
        margin: 0;
        padding: 0;
        margin-right: 10px;
    }
    #bar-adjustors button {
        margin-left: 5px;
        width: 25px;
        height: 25px;
    }
    #variable-selector {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
    }
    #variable-selector h1 {
        margin: 0;
        margin-bottom: 15px;
        padding: 0;
        font-size: 16px;
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
