<script lang="ts">
	import BalanceLabel from './BalanceLabel.svelte';
	import SettlementEdgeStatus, { type SettlementEdge } from './SettlementEdgeStatus.svelte';

	interface SettlementEdgeWithNames extends SettlementEdge {
		fromName: string;
		toName: string;
	}

	let {
		person,
		direction,
		currentUserId,
		showStatus = true
	}: {
		person: { id: string; name: string; totalCents: number; edges: SettlementEdgeWithNames[] };
		direction: 'creditor' | 'debtor';
		currentUserId?: string;
		showStatus?: boolean;
	} = $props();

	const isCurrentUser = $derived(person.id === currentUserId);
</script>

<li class="settlement-list__group">
	<p class="settlement-list__person">
		<span class="list-item__title">{isCurrentUser ? 'You' : person.name}</span>
		<BalanceLabel
			cents={direction === 'creditor' ? person.totalCents : -person.totalCents}
			{isCurrentUser}
		/>
	</p>
	<ul class="list">
		{#each person.edges as edge (edge.id)}
			<li class="list-item">
				<span class="list-item__title"
					>{direction === 'creditor'
						? `by ${edge.fromUser === currentUserId ? 'you' : edge.fromName}`
						: `to ${edge.toUser === currentUserId ? 'you' : edge.toName}`}</span
				>
				<SettlementEdgeStatus {edge} {currentUserId} {showStatus} allowMarkPaid={false} />
			</li>
		{/each}
	</ul>
</li>
