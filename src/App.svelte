<script>
	import { Router, Route, Link } from 'svelte-routing';
	import Home from './routes/Home.svelte';
	import About from './routes/About.svelte';
  </script>
  
  <Router>
	<Route path="/" component={Home} />
	<Route path="/aboutus" component={About} />
  </Router>