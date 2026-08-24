<script lang="ts">
	let { title }: { title?: string } = $props();
</script>

<svelte:head>
	<title>{title ? `${title} - splot` : 'splot'}</title>
</svelte:head>
