import { h, Component } from 'preact';
import style from './style';
import * as firebase from 'firebase';

//Components
import Card from '../../../components/card';

export default class Upcomming extends Component{
	state={
		cards: []
	}
	constructor(props){
		super(props);
		firebase.firestore().collection('tournaments').where('registrationEndDate','>',Date.now()).orderBy('registrationEndDate','desc').onSnapshot((e) => {
			if (e.docs.length===0&&navigator.onLine)
				this.setState({ noTournaments: true });

			this.setState({ cards: e.docs });
		});
		document.title='Tournaments';
	}
	render() {
		
		return (
			<div>
				
				{
					this.state.cards.length>0?
						this.state.cards.map((e) => <Card doc={e} />) :
						<div class={style.card}>
							{this.state.noTournaments?'Currently there is no tournament to register.':<div class={style.skeleton} />}
					
						
						</div>
				}
				
			</div>
			
		);
	}
}