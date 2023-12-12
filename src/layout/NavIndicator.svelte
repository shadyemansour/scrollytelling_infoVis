<script>
	import { onMount, onDestroy } from 'svelte';
	import { subscribe as subscribeSize } from '../helpers/resizeService';
	import { subscribe as subscribeScroll } from '../helpers/scrollService.js';

	let dimensions = { width: 0, height: 0 };
	let scrollY = 0;
	let maxScrollY = 0;

	function updateDimensions() {
		dimensions.width = window.innerWidth;
		dimensions.height = window.innerHeight;
	}

	function updateScrollY(position) {
		scrollY = position;
	}

	function getMaxScrollY() {
        const height = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );
		const documentHeight = document.documentElement.scrollHeight;
		const viewportHeight = window.innerHeight;
		return height -viewportHeight;
	}

	onMount(() => {
		const unsubscribeSize = subscribeSize(updateDimensions);
		const unsubscribeScroll = subscribeScroll(updateScrollY);
		updateDimensions(); // Initial update
		updateScrollY(window.scrollY); // Initial update
        
        setTimeout(()=>{
            maxScrollY = getMaxScrollY();
        }, 500)

        
		onDestroy(() => {
            unsubscribeSize();
			unsubscribeScroll();
		});
	});
</script>

<div class="nav-container">
	<div
		style="height: {(scrollY / maxScrollY) * 100}vh; background-color: red; min-width: 4px">

    </div>The current scroll position is {scrollY}px.
    max scrill {maxScrollY}
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
		background-color: blue;
		z-index: 10;
	}
</style>
