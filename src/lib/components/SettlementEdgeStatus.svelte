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

	const isParticipant = $derived(currentUserId === edge.fromUser || currentUserId === edge.toUser);
	const isPayer = $derived(currentUserId === edge.fromUser);
	const isReceiver = $derived(currentUserId === edge.toUser);
</script>

<span class="list-item__end">
	<span class="balance">{formatCents(edge.amountCents)}</span>
	{#if showStatus}
		{#if edge.status === 'paid'}
			<span class="tag tag--paid">Paid</span>
		{:else if isParticipant && allowMarkPaid}
			<form method="POST" action="?/markPaid" use:enhance>
				<input type="hidden" name="settlementId" value={edge.id} />
				<button type="submit" class="button button--secondary button--small">Mark as paid</button>
			</form>
		{:else if isPayer}
			<span class="tag tag--negative">Waiting for you</span>
		{:else if isReceiver}
			<span class="tag tag--pending">Waiting on them</span>
		{:else}
			<span class="tag">Waiting</span>
		{/if}
	{/if}
</span>
