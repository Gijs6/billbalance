<script lang="ts">
	import * as m from '$lib/paraglide/messages';

	let { message }: { message: string } = $props();
	let visible = $state(true);

	$effect(() => {
		const timeout = setTimeout(() => (visible = false), 6000);
		return () => clearTimeout(timeout);
	});
</script>

{#if visible}
	<div class="toaster" aria-live="polite">
		<div class="toast toast--success" role="status">
			<div class="toast__body">{message}</div>
			<button
				type="button"
				class="toast__dismiss"
				aria-label={m.common_dismiss()}
				onclick={() => (visible = false)}>&times;</button
			>
		</div>
	</div>
{/if}
