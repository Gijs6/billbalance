<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/styles/app.css';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="layout">
	{#if data.user}
		<nav class="nav" aria-label={m.nav_mainLabel()}>
			<a class="nav__brand" href={resolve('/')}>billbalance</a>
			<ul class="nav__links">
				<li><a class="nav__link" href={resolve('/settings')}>{m.nav_settings()}</a></li>
				<li><a class="nav__link" href={resolve('/account')}>{data.user.name}</a></li>
				<li>
					<form method="POST" action="/logout">
						<Button type="submit" variant="secondary" small>{m.common_logOut()}</Button>
					</form>
				</li>
			</ul>
		</nav>
	{/if}
	<main class="layout__main">
		{@render children()}
	</main>
	{#if !data.user}
		<Footer />
	{/if}
	{#if data.flash}
		<Toast message={data.flash} />
	{/if}
</div>
