<script>
	import { onMount, onDestroy } from 'svelte';
	import { subscribe as subscribeSize } from '../helpers/resizeService';
	import { subscribe as subscribeScroll } from '../helpers/scrollService.js';
	import { themes } from '../config';

	export let maxScrollY = 0;

	let dimensions = { width: 0, height: 0 };
	let scrollY = 0;

	let unsubscribeSize;
	let unsubscribeScroll;

	function updateDimensions() {
		dimensions.width = window.innerWidth;
		dimensions.height = window.innerHeight;
	}

	function updateScrollY(position) {
		scrollY = position;
	}

	$: if (maxScrollY) {
		updateDimensions(); // Initial update
		updateScrollY(window.scrollY); // Initial update
	}

	onMount(() => {
		unsubscribeSize = subscribeSize(updateDimensions);
		unsubscribeScroll = subscribeScroll(updateScrollY);
		updateDimensions(); // Initial update
		updateScrollY(window.scrollY); // Initial update
	});

	onDestroy(() => {
		unsubscribeSize();
		unsubscribeScroll();
	});
</script>

<div class="nav-container">
    <div
        style="height: {(scrollY / maxScrollY) * 100}vh; background-color: {themes.oepnv.primary}; min-width: 4px"
    ></div>
	<div
		style="height: {(scrollY / maxScrollY) * 100}vh; background-color: {themes.bike.primary}; min-width: 4px"
	></div>
	<div
		style="height: {(scrollY / maxScrollY) * 100}vh; background-color: {themes.car.primary}; min-width: 4px"
	></div>
</div>

<style>
	.nav-container {
		position: fixed;
		display: flex;
		height: 100vh;
		width: 12px;
		left: 0;
		top: 0;
		right: auto;
		bottom: 0;
		background-color: rgba(54, 28, 28, 0.2);
		z-index: 10;
	}
</style>
