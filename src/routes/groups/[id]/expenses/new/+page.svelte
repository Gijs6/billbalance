<script lang="ts">
	import ExpenseForm from '$lib/components/ExpenseForm.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<PageTitle title={m.expenses_addCta()} />

<h1>{m.expenses_addCta()}</h1>

<ExpenseForm
	members={data.members}
	currentUserId={data.currentUserId}
	submitLabel={m.expenses_addCta()}
	message={form?.message}
	initialPaidByUser={data.currentUserId}
/>
