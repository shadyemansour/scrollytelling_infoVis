<script>
    import IconWrapper from "./IconWrapper.svelte";
	export let links;
</script>

<div class="links">
	{#each links as link}
		<div class="link">
			<a href={link.url} target="_blank" alt="{link.name}">
				<IconWrapper innerSize={'24px'} name={link.iconName}></IconWrapper>
			</a>
		</div>
	{/each}
</div>

<style>
	.link {
		color: grey;
	}
	.link:hover {
		color: black;
	}

	.links {
		display: flex;
		align-self: baseline;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		gap: 16px;
	}
</style>
