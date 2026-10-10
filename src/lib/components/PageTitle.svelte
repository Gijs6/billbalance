<script lang="ts">
	let { title }: { title?: string } = $props();
</script>

<svelte:head>
	<title>{title ? `${title} - Billbalance` : 'Billbalance'}</title>
</svelte:head>
