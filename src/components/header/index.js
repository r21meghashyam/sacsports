import { h, Component } from 'preact';
import { Link, route } from 'preact-router';
import style from './style';
import logo from '../../assets/logo.png';
import * as firebase from 'firebase';
import { store, icon } from '../../lib';

export default class Header extends Component {
	state = { open: false ,
		isAdmin: false,
		width: window.innerWidth,
		loggedIn: false
	};

	showMenu(){
		store.dispatch({ type: 'SHOW_SIDEBAR' });
	}
	openProfile(){
		route('/profile');
	}

	constructor(props){
		super(props);
		window.onresize=() => {
			this.setState({ width: window.innerWidth });
		};
		store.subscribe(() => {
			let d=store.getState();
			
			if (d.type==='AUTH_CHANGE')
				this.setState({ loggedIn: d.loggedIn });
		});
		
	}
	componentDidUpdate(){
		if (firebase.auth().currentUser){
			firebase.database().ref('/numbers/'+firebase.auth().currentUser.phoneNumber).once('value',(e) => {
				let js=e.toJSON();
				if (js.type==='admin')
					this.setState({ isAdmin: true });
			});
		}
		
	}


	render() {
		
		return (
			<header class={style.header} open={this.state.open}>
				<h1>
					
					{this.state.width>800?<Link href="/"><img src={logo} /></Link>:<i class={icon('bars')} onClick={this.showMenu} />}
					<Link href="/">SAC Network</Link>
					{this.state.loggedIn?<img src="/assets/user.png" class={style.user} onClick={this.openProfile} />:''}
				</h1>
			</header>
		);
	}
}

