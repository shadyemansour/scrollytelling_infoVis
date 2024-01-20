<!-- AboutCard.svelte -->

<script>
	import { themes } from '../config.js';
	import LinkList from '../ui/LinkList.svelte';
	export let imageUrl;
	export let name;
	export let description;
	export let links;
</script>

<div class="card">
	<div>
		{#if imageUrl}
			<img src={imageUrl} alt="Profile" class="image" />
		{/if}
		{#if name}
			<p class="name">{name}</p>
			{#if links}
				<LinkList {links} />
			{/if}
		{/if}
		{#if description}
			<p class="description" style={themes.neutral['text-dark'].secondary}>{description}</p>
		{/if}
	</div>
</div>

<style>
	.card {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		max-width: 100%;
		border: 1px solid #ccc;
		border-radius: 500px 500px 50px 50px;
		padding: 16px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		text-align: center;
	}

	.image {
		max-width: 100%;
		border-radius: 50%;
		margin-bottom: 12px;
	}

	.name {
		font-size: 1.5em;
		font-weight: bold;
		margin-bottom: 8px;
	}

	.description {
		color: #555;
	}
</style>
