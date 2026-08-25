<script lang="ts">
	import type { Snippet } from 'svelte';

	let { for: htmlFor, children }: { for: string; children: Snippet } = $props();
</script>

<label class="form__label" for={htmlFor}>{@render children()}</label>
