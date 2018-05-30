import { h, Component } from 'preact';
import style from './style';
import * as firebase from 'firebase';
import { store } from '../../lib';
import { Link }  from 'preact-router';

export default class Profile extends Component {
	state={
		phoneNumber: null,
		type: null
	}
	
	updateState(){
		if (firebase.auth().currentUser)
			firebase.firestore().doc('users/'+firebase.auth().currentUser.phoneNumber).onSnapshot((d) => {
				this.setState(d.data());
				//console.log(this.state);
			});
	}

	constructor(props){
		super(props);
		this.setState(firebase.auth().currentUser);
		
		this.updateState();
		store.subscribe(() => {
			let state=store.getState();
			if (state.type==='AUTH_CHANGE')
				this.updateState();
		});
		
	}
	render() {
		
		return (
			<div>
				<div class={style.title}>Profile</div>
		
					
				<div class={style.card}>
					<div>
						<img src="/assets/user.png" />
					</div>
					<div>
						<h1>{this.state.displayName}</h1>
						{this.state.registerNumber?<div>Register Number: {this.state.registerNumber}</div>:''}
						{this.state.phoneNumber?<div>Phone Number: {this.state.phoneNumber}</div>:''}
						{this.state.type?<div>Type: {this.state.type}</div>:''}
						<Link href="/logout" class={style.button}>Logout</Link>
					</div>
				</div>
				
				
			</div>
			
		);
	}
}
