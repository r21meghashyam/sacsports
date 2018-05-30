import { h, Component } from 'preact';
import style from './style';
import * as firebase from 'firebase';
import version from '../../manifest.json';

export default class Update extends Component {
	state={
		changesLog: []
	}
	
	loadLog(){
		firebase.firestore().collection('versions').onSnapshot((d) => {
			this.setState({ changesLog: d.docs });
		});
	}
	constructor(props){
		super(props);
		this.loadLog=this.loadLog.bind(this);
		firebase.firestore().collection('versions').orderBy('date','desc').limit(1).onSnapshot((d) => {
			this.setState(d.docs[0].data());
		});
		
	}
	render() {
		
		return (
			<div class={style.update}>
				<div class={style.title}>Major Update</div>
		
					
				<div class={style.card}>
					<div>
						Current Version: 	<b>{version.major}.{version.minor}.{version.patch}-beta</b>
					</div>
					<div>Latest Version: 	<b>{this.state.major}.{this.state.minor}.{this.state.patch}-beta</b></div>
					An major update needs to be downloaded. Please restart your browser if the update process does not  begin.
				</div>
				
				
			</div>
			
		);
	}
}
