<script lang="ts">
    import features from "../state/features.svelte";

    const { filter } = $props();

    function remove() {
        features.removeFilter(filter.slice, filter.relationship, filter.value);
    }
</script>

<div>
    <p>{filter.slice}</p>
    <p>{filter.relationship}</p>
    <p>{filter.value}</p>

    <button onclick={remove}>Remove</button>
</div>
