<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/styles/app.css';
	import { resolve } from '$app/paths';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="layout">
	{#if data.user}
		<nav class="nav" aria-label="Main">
			<a class="nav__brand" href={resolve('/')}>billbalance</a>
			<ul class="nav__links">
				<li><span class="nav__link">{data.user.name}</span></li>
				<li>
					<form method="POST" action="/logout">
						<button type="submit" class="button button--secondary button--small">Log out</button>
					</form>
				</li>
			</ul>
		</nav>
	{/if}
	<main class="layout__main">
		{@render children()}
	</main>
</div>
