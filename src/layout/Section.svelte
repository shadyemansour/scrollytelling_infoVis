<script>
	import { themes } from '../config.js';

</script>

<section style="color: {themes['neutral']['text-dark']['primary']}; background-color: {themes['neutral']['background']}">
	<div class="col-medium">
		<slot></slot>
	</div>
</section>