<script lang="ts">
	let { message }: { message: string } = $props();
	let visible = $state(true);

	$effect(() => {
		const timeout = setTimeout(() => (visible = false), 4000);
		return () => clearTimeout(timeout);
	});
</script>

{#if visible}
	<p class="toast" role="status">{message}</p>
{/if}
