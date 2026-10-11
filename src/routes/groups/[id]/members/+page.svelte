<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import { getLocale } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const joinUrl = $derived(`${data.origin}/join/${data.group.joinCode}`);
	async function copyLink() {
		await navigator.clipboard.writeText(joinUrl);
		window.toast(m.common_linkCopied(), { type: 'success' });
	}

	const dateFormatter = new Intl.DateTimeFormat(getLocale(), {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});
</script>

<PageTitle title={m.members_titleSuffix({ name: data.group.name })} />

<section class="panel" aria-labelledby="join-heading">
	<h2 id="join-heading" class="panel__heading">{m.members_joinCodeHeading()}</h2>
	<div class="panel__body">
		<p class="muted">{m.members_joinCodeHint()}</p>
		<p class="join-code">
			<span class="visually-hidden">{m.members_joinCodeLabel()}:</span>
			{data.group.joinCode}
		</p>
		<div class="input-row">
			<input
				type="text"
				readonly
				value={joinUrl}
				aria-label={m.members_joinLinkAriaLabel()}
				onclick={(e) => e.currentTarget.select()}
			/>
			<Button onclick={copyLink}>{m.common_copyLink()}</Button>
		</div>
	</div>
</section>

<section class="panel" aria-labelledby="members-heading">
	<h2 id="members-heading" class="panel__heading">{m.group_tabMembers()}</h2>
	<div class="table-wrap">
		<table class="table">
			<tbody>
				{#each data.members as member (member.id)}
					<tr>
						<th scope="row" class="row__title"
							>{member.id === data.user?.id ? m.common_you() : member.name}</th
						>
						<td class="muted"
							>{m.members_memberSince({ date: dateFormatter.format(member.joinedAt) })}</td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>
