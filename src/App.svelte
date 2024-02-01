<script>
	import { Router, Route, Link, navigate } from 'svelte-routing';
	import { onMount } from 'svelte';
	import { lenisStore } from "./helpers/store.js";
	import Lenis from '@studio-freight/lenis';
	import Home from './routes/Home.svelte';
	import About from './routes/About.svelte';
	import Empty from './routes/Empty.svelte';

	// SMOOTH SCROLLING
	const lenis = new Lenis({
		lerp: 0.1
	});
	lenisStore.set(lenis);

	function raf(time) {
		lenis.raf(time);
		requestAnimationFrame(raf);
	}
	requestAnimationFrame(raf);

	let language = 'de'; 
  
	// Ändern Sie die Spracheinstellung, wenn die Komponente eingefügt wird
	onMount(() => {
	  document.documentElement.lang = language;
	});
	
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
