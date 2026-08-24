<script lang="ts">
	let { title }: { title?: string } = $props();
</script>

<svelte:head>
	<title>{title ? `${title} - billbalance` : 'billbalance'}</title>
</svelte:head>
