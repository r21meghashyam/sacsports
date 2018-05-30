import { h, Component } from 'preact';
import style from './style';
import { Link } from 'preact-router';
import * as firebase from 'firebase';
import { convertToDate, icon } from '../../../lib';

export default class OnGoing extends Component{
	state={
		cards: {}
	}
	constructor(props){
		super(props);
		
		firebase.firestore().collection('tournaments').where('endDate','>',Date.now()).orderBy('endDate','desc').limit(20).onSnapshot((e) => {
			let cards={};
			e.docs.filter(doc => doc.data().startDate<Date.now()).map(doc => {
				cards[doc.id]=doc.data();
				this.setState({ cards });
				doc.ref.collection('registered_teams').onSnapshot(teams => {
					cards[doc.id].registered_teams=teams.size;
					this.setState({ cards });
				});
			});
			if (Object.keys(cards).length===0&&navigator.onLine)
				this.setState({ noTournaments: true });
			
			
		});
	}
	render() {
		
		return (
			<div>
				
				{
					Object.keys(this.state.cards).length>0?
						Object.keys(this.state.cards).map((e) =>
							(<div class={style.card}>
								<h1>{this.state.cards[e].title}</h1>
								<pre>
									{this.state.cards[e].details.substr(0,100)}
								</pre>
								<div>
									<i class={icon('calendar')} /> From  {convertToDate(this.state.cards[e].startDate)} to {convertToDate(this.state.cards[e].endDate)}
								</div>
								<div>
									<i class={icon('user')} />Teams registered: {this.state.cards[e].registered_teams}
								</div>
								<div>
									<Link href={'/tournaments/'+e+'/fixture'}><button>View Fixtures</button></Link>
								</div>
							</div>)):
						<div class={style.card}>
							{this.state.noTournaments?'Currently there is no tournament going on.':<div class={style.skeleton} />}
					
						
						</div>
				}
				
			</div>
			
		);
	}
}