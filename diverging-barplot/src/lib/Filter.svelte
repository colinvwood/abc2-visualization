<script lang="ts">
    import features from "../state/features.svelte";

    const { filter } = $props();

    function remove() {
        features.removeFilter(filter.slice, filter.relationship, filter.value);
    }

    const getSymbol = (relationship: string) => {
        if (relationship == "gt") return ">";
        if (relationship == "ge") return ">=";
        if (relationship == "lt") return "<";
        if (relationship == "le") return "<=";
    };
    const symbol = getSymbol(filter.relationship);
</script>

<div class="filter">
    <p>{filter.slice} {symbol} {filter.value}</p>

    <button onclick={remove}>Remove</button>
</div>

<style>
    .filter {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        padding: 10px;
        background-color: lightblue;
        margin-left: 15%;
        margin-right: 15%;
        margin-bottom: 10px;
        border-radius: 5px;
    }
    .filter p {
        font-size: 16px;
        font-weight: bold;
        margin: 0;
        padding: 0;
        transform: translate(0px, 1px);
    }
</style>
