<script>
  import { themes } from '../config.js';
	import { getContext } from 'svelte';
	import {link } from "svelte-routing";


	export let theme = getContext('theme');
	export let filled = false;
	export let center = true;
</script>

<nav style="background-color: {themes.light.brand}">
  <div class="col-wide middle" class:center>
		<a href="/" use:link>
			<picture>
				<img src="/img/favicon.png" alt="Team 7">

			</picture>
		</a>
  </div>
</nav>

<style>
	nav {
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		height: 64px;
		z-index: 1;
	}
	picture {
		padding: 0 5px;
	}
	img {
		width: auto;
		height: 40px;
	}
	a img:hover {
		cursor: pointer;
	}
</style>