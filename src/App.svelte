<script>
	import { Router, Route, Link } from 'svelte-routing';
	import Home from './routes/Home.svelte';
	import About from './routes/About.svelte';
	import Test from './routes/Test.svelte';

	var startingSite = Home;
</script>

<Router>
	<Route path="/" component={startingSite} />
	<Route path="/aboutus" component={About} />
</Router>
