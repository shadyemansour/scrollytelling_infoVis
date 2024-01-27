<script>
	import { themes } from '../config.js';
	import GitHub from './icons/Github.svelte';
	import LinkedIn from './icons/LinkedIn.svelte';
	import Globe from './icons/Globe.svelte';
	import ArrowLeft from './icons/ArrowLeft.svelte';
	import ArrowUp from './icons/ArrowUp.svelte';
	import Negative from './icons/Negative.svelte';
	import Positive from './icons/Positive.svelte';

	export let name = 'GitHub';
	// export let color = themes.neutral['text-dark'].primary;
	export let innerSize = '0.8rem';
	export let outerSize = '1rem';

	let icons = {
		GitHub,
		LinkedIn,
		Globe,
		ArrowLeft,
		ArrowUp,
		Negative,
		Positive
	};
</script>

<div class="iconWrapper" style="width: {outerSize}; height: {outerSize}">
	<div class="iconCenter" style="width: {innerSize}; height: {innerSize}">
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
