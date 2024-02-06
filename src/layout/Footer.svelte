<script>
	import { themes } from '../config.js';
	import { link } from 'svelte-routing';
</script>

<footer
	id="footer"
	style="color: {themes['neutral']['text']['primary']}; background-color: {themes['neutral'][
		'pale'
	]};"
>
	<div class="col-wide" data-analytics="footer">
		<a href="/" use:link>
			<img class="logo-img" src="./img/favicon.png" alt="Team 7" />
		</a>
		<div>
			<ul>
				<li>
					<a class="link" href="/aboutus" use:link>Unser Dreamteam</a>
				</li>
				<li>
					<a class="link" href="https://github.com/shadyemansour/scrollytelling_infoVis" use:link
						>Repository</a
					>
				</li>
			</ul>
			<p style="color: {themes['neutral']['text-dark']['teritary']};">
				Letztes Update am 28.01.2024
			</p>
		</div>
	</div>
</footer>

<style>
	footer {
		padding-bottom: 72px;
		padding-top: 36px;
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
	}
</style>
