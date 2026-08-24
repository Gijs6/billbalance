<script lang="ts">
	import ExpenseForm from '$lib/components/ExpenseForm.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<PageTitle title="Add expense" />

<h1>Add expense</h1>

<ExpenseForm
	members={data.members}
	submitLabel="Add expense"
	errorMessage={form?.message}
	initialPaidBy={data.currentUserId}
/>
