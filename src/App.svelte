<script>
	import { Router, Route, Link } from 'svelte-routing';
	import Lenis from '@studio-freight/lenis'
	import Home from './routes/Home.svelte';
	import About from './routes/About.svelte';

	var startingSite = Home; // Set starting Site

	// SMOOTH SCROLLING
	const lenis = new Lenis({
		lerp: .1
	});
	lenis.on('scroll', (e) => {
		//console.log(e);
	});
	function raf(time) {
		lenis.raf(time);
		requestAnimationFrame(raf);
	}
	requestAnimationFrame(raf);
</script>

<Router>
	<Route path="/" component={startingSite} />
	<Route path="/aboutus" component={About} />
</Router>
