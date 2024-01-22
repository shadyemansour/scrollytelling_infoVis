<script>
	import { Router, Route, Link, navigate } from 'svelte-routing';
	import Lenis from '@studio-freight/lenis';
	import Home from './routes/Home.svelte';
	import About from './routes/About.svelte';
	import Empty from './routes/Empty.svelte';

	// SMOOTH SCROLLING
	const lenis = new Lenis({
		lerp: 0.1
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

<svelte:head>
	<title>Team 7</title>
	<html lang="de"/>
</svelte:head>

<Router>
	<Route path="/" component={Home} />
	<Route path="/aboutus" component={About} />
	<Route path="/empty" component={Empty} />
</Router>
