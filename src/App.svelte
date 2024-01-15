<script>
	import { Router, Route, Link, navigate } from 'svelte-routing';
	import Lenis from '@studio-freight/lenis';
	import Home from './routes/Home.svelte';
	import About from './routes/About.svelte';

	export let url = '/'; // Set starting Site

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

<!-- <Router>
    <Route path="/" component={Home} />
    <Route path="/aboutus" component={About} />
    <nav>
        <Link to="/">Home</Link>
        <Link to="/aboutus">About Us</Link>
    </nav>
</Router> -->

<Router {url}>
	<Route path="/" component={Home} />
	<Route path="/aboutus" component={About} />
</Router>
