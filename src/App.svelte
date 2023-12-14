<script>
	import { Router, Route, Link } from 'svelte-routing';
	import Home from './routes/Home.svelte';
	import About from './routes/About.svelte';

	var startingSite = Home; // Set starting Site
</script>

<Router>
	<Route path="/" component={startingSite} />
	<Route path="/aboutus" component={About} />
</Router>
