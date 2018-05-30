import { h, Component } from 'preact';
import style from './style';
import * as firebase from 'firebase';
import manifest from '../../../manifest.json';

let version = manifest.app_version;

export default class AppPage extends Component {
	state={
		changesLog: []
	}

	constructor(props){
		super(props);
		
		firebase.firestore().collection('versions').orderBy('date','desc').limit(1).onSnapshot(d => this.setState(d.docs[0].data()));
		firebase.firestore().collection('versions').orderBy('date','desc').onSnapshot(d => this.setState({ changesLog: d.docs }));
	}

	render() {
		return (
			<div class={style.adminUser}>
				<div class={style.title}>App Details</div>
				
				<div class={style.card+' '+style.regForm}>
					<div>
						Current Version: 	<b>{version.major}.{version.minor}.{version.patch}-beta</b>
					</div>
					<div>Latest Version: 	<b>{this.state.major}.{this.state.minor}.{this.state.patch}-beta</b></div>
					<div class={style.changeLogs}>
					Changes done:
						{
							this.state.changesLog.map(i =>
								(<details>
									<summary>v{i.id}</summary>
									<ul>
										{i.data().changes.map(j => <li>{j}</li>)}
									</ul>
								</details>)
							)
						}
					</div>
				</div>
			</div>
		);
	}
}
