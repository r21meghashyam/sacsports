import { h, Component } from 'preact';
import style from './style';

import { store } from '../../lib';

//Routes
import Routes from '../../routes';


class Section extends Component {
	state=
	{
		url: '',
		classes: style.page+' '+style.marginLeft,
		mobile: window.innerWidth<800
	}

	constructor(props){
		super(props);
		
		/*
		window.addEventListener('online',  () => {
			this.setState({ message: null });
		}),false;

		window.addEventListener('offline',  () => {
			this.setState({ message: 'You are currently offline.' });
		}),false;
	
		if (navigator.onLine===false)
			this.setState({ message: 'You are currently offline.' });
		
		window.addEventListener('swupdated',() => {
			this.setState({ message: 'App updated. Reloading to apply changes.' });
		});
		window.addEventListener('swupdating',() => {
			this.setState({ message: 'Updating... please wait...' });
		});
		*/

		store.subscribe(() => {
			let storeState = store.getState();
			
			if (storeState.type==='MARGIN_SECTION')
				this.setState({ classes: style.page+' '+(storeState.sidebarShrinked?'':style.marginLeft) });
		});
	
	}
	render(){
		return (
			<div class={this.state.classes}>
				<Routes />
			</div>
		);
	}

}

export default Section;

