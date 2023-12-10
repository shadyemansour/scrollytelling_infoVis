<!-- AboutCard.svelte -->

<script>
	export let imageUrl;
	export let name;
	export let description;
</script>

<div class="card">
	{#if imageUrl}
		<img src={imageUrl} alt="Profile" class="image" />
	{/if}
	{#if name}
		<p class="name">{name}</p>
	{/if}
	{#if description}
		<p class="description">{description}</p>
	{/if}
</div>

<style>
	.card {
		width: 250px;
		border: 2px solid #ccc;
		border-radius: 8px;
		padding: 16px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		text-align: center;
		margin: 32px;
	}

	.image {
		max-width: 100%;
		border-radius: 50%;
		margin-bottom: 12px;
	}

	.name {
		font-size: 1em;
		font-weight: bold;
		margin-bottom: 8px;
	}

	.description {
		font-size: 0.8em;
		color: #555;
	}
</style>
