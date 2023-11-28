	<script>
	import { themes } from '../config.js';
	import { link } from "svelte-routing";
	import About from '../routes/About.svelte';

</script>

<footer style="color: {themes['neutral']['text']['primary']}; background-color: {themes['neutral']['pale']};">
	<div class="col-wide" data-analytics="footer">
		<a href="/" use:link>
			<img
				class="logo-img"
				src="./img/favicon.png"
				alt="Team 7" />

		</a>
		<div>
		<ul>
			<li><a class="link" href="/aboutus" use:link style="color: {themes['brand']['text']['primary']}">Unser Dreamteam</a></li>
			<li><a class="link" href="/"  use:link style="color: {themes['brand']['text']['primary']}">Repository</a></li>
			<li><a class="link" href="/sources"  use:link style="color: {themes['brand']['text']['primary']}">Quellen</a></li>

		</ul>
		<p style="color: {themes['neutral']['text-dark']['teritary']};">Letztes Update am 28.11.2023</p>
</footer>

<style>
	footer {
		padding-bottom: 72px;
		padding-top: 36px;
		font-size: 18px;
	}
	footer a.link {
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		text-decoration: none;
		display: inline-block;
	}
	footer a.link:hover {
		color: #222;
	}
	footer a.link:active {
		outline: 3px solid transparent;
		background-color: #fd0;
		-webkit-box-shadow: 0 -2px #fd0, 0 4px #222;
		box-shadow: 0 -2px #fd0, 0 4px #222;
		color: #222;
	}
	ul {
		padding: 0;
		margin: 0;
	}
	li {
		margin-right: 18px;
		display: inline-block;
	}
	.logo-img {
		margin-bottom: 27px;
		width: 48px;
		height: 48px;
	}

	a img:hover {
		cursor: pointer;
	}
</style>