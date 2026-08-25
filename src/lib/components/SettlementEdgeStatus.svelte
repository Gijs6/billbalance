<script module lang="ts">
	export interface SettlementEdge {
		id: string;
		amountCents: number;
		status: 'pending' | 'paid';
		fromUser: string;
		toUser: string;
	}
</script>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatCents } from '$lib/money';
	import { getLocale } from '$lib/paraglide/runtime';
	import Button from './Button.svelte';
	import StatusLabel from './StatusLabel.svelte';

	let {
		edge,
		currentUserId,
		showStatus = true,
		allowMarkPaid = true
	}: {
		edge: SettlementEdge;
		currentUserId?: string;
		showStatus?: boolean;
		allowMarkPaid?: boolean;
	} = $props();

	const locale = getLocale();

	const isParticipant = $derived(currentUserId === edge.fromUser || currentUserId === edge.toUser);
	const isPayer = $derived(currentUserId === edge.fromUser);
	const isReceiver = $derived(currentUserId === edge.toUser);
</script>

<span class="list-item__end">
	<span class="balance">{formatCents(edge.amountCents, locale)}</span>
	{#if showStatus}
		{#if edge.status === 'paid'}
			<StatusLabel variant="paid">Paid</StatusLabel>
		{:else if isParticipant && allowMarkPaid}
			<form method="POST" action="?/markPaid" use:enhance>
				<input type="hidden" name="settlementId" value={edge.id} />
				<Button type="submit" variant="secondary" small>Mark as paid</Button>
			</form>
		{:else if isPayer}
			<StatusLabel variant="negative">Waiting for you</StatusLabel>
		{:else if isReceiver}
			<StatusLabel variant="pending">Waiting on them</StatusLabel>
		{:else}
			<StatusLabel>Waiting</StatusLabel>
		{/if}
	{/if}
</span>
