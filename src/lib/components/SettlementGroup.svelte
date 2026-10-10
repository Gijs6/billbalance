<script lang="ts">
	import * as m from '$lib/paraglide/messages';
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

<tbody>
	<tr class="settlement__person">
		<th scope="rowgroup" colspan="3">
			{isCurrentUser ? m.common_you() : person.name},
			<BalanceLabel
				cents={direction === 'creditor' ? person.totalCents : -person.totalCents}
				{isCurrentUser}
			/>
		</th>
	</tr>
	{#each person.edges as edge (edge.id)}
		<tr>
			<td>
				{direction === 'creditor'
					? m.settlement_paidBy({
							name: edge.fromUser === currentUserId ? m.common_youLower() : edge.fromName
						})
					: m.settlement_paidTo({
							name: edge.toUser === currentUserId ? m.common_youLower() : edge.toName
						})}
			</td>
			<SettlementEdgeStatus {edge} {currentUserId} {showStatus} allowMarkPaid={false} />
		</tr>
	{/each}
</tbody>
