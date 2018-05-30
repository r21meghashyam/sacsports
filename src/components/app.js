import { h } from 'preact';
import Header from './header';
import Sidebar from './sidebar';
import Section from './section';

if (module.hot) {
	require('preact/debug');
}


const App = i => (
	<div id="app">
		<Header />
		<Sidebar />
		<Section />
	</div>
);

export default App;
