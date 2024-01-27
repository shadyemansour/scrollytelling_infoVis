<script>
	import { themes } from '../config.js';
	import GitHub from './icons/Github.svelte';
	import LinkedIn from './icons/LinkedIn.svelte';
	import Globe from './icons/Globe.svelte';
	import ArrowLeft from './icons/ArrowLeft.svelte';
	import ArrowUp from "./icons/ArrowUp.svelte";
	export let name = 'GitHub';
	// export let color = themes.neutral['text-dark'].primary;
	export let size = '1rem';

	let icons = {
		GitHub,
		LinkedIn,
		Globe,
		ArrowLeft,
		ArrowUp
	};
</script>

<div class="iconWrapper" >
	<div class="iconCenter" style="width: {size}; height: {size}">
		<svelte:component this={icons[name]} />
	</div>
</div>

<style>
	.iconWrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		align-self: center;
		width: 100%;
		height: 100%;
	}
	.iconCenter {
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
