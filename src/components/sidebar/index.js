import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';
import { store, icon } from '../../lib';
import * as firebase from 'firebase';

export default class Sidebar extends Component {
	state={
		//sidebar defaults for big screens
		sidebarHidden: false,
		sidebarShrinked: false,
		sidebarClass: '',
		smallScreen: false,
		navs: []
	}
	
	handleNavs(){
		let navs = [];
		
		navs.push(['',[['Home','/','home']]]);
		navs.push(['SPORTS',
			[
				['Tournaments','/tournaments','trophy']
			]
		]);
		let app = ['APP',
			[
				['About','/about','info'],
				['Report','/report','bug']
			]
		];

		if (firebase.auth().currentUser){
			let firestore = firebase.firestore();
			return firestore.doc('/users/'+firebase.auth().currentUser.phoneNumber).onSnapshot((d) => {
				
				if (d.exists){
					if (d.data().isStudent)
						navs.push(['Student',
							[
								['Attendance','/student/attendance','calendar']
								
								
							]
						]);
					if (d.data().isStaff)
						navs.push(['Staff',
							[
								['Attendance Management','/staff/attendance','calendar']
								
								
							]
						]);
					if (d.data().isSportsIncharge)
						navs.push(['Sports Dept.',
							[
								['Tournament Management','/admin/tournaments','trophy'],
								['Stocks Management','/admin/stocks','futbol']
								
								
							]
						]);
					if (d.data().isAdmin)
						navs.push(['ADMIN',
							[
								['Users Management','/admin/users','users'],
								['Class Management','/admin/attendance','calendar'],
								['App','/admin/app','react','fab']
							]
						]);
					
				}
				navs.push(['ACCOUNT',
					[
						['Profile','/profile','user']
					]
				]);
				navs.push(app);
				this.setState({ navs });
			});
		}
		
		navs.push(['ACCOUNT',
			[
				['Login','/login','sign-in-alt']
			]
		]);
		navs.push(app);
		this.setState({ navs });
	}

	handleScreen(){
		
		this.setState({ smallScreen: window.innerWidth<800 });
		if (this.state.smallScreen){
			if (this.state.sidebarShrinked)
				this.toggleSidebarSize();
		}
		else if (this.state.sidebarHidden)
			this.showSidebar();
		
	}

	showSidebar(){
		
		this.setState({
			sidebarHidden: false,
			sidebarClass: ''
		});
	}
	hideSidebar(){
		
		this.setState({
			sidebarHidden: true,
			sidebarClass: ' '+style.hide
		});
	}
	
	toggleSidebarSize(){
		
		let sidebarShrinked=!this.state.sidebarShrinked;
		this.setState({
			sidebarShrinked,
			sidebarClass: sidebarShrinked ? ' '+style.shrink:''
		});
		store.dispatch({ type: 'MARGIN_SECTION', sidebarShrinked });
	}

	handleTogglingArrow(){
		if (this.state.smallScreen){
			
			store.dispatch({ type: 'HIDE_SIDEBAR' });
		}
		else
			this.toggleSidebarSize();
			
	}

	constructor(props){
		super(props);

		//bind methods to the class
		this.showSidebar=this.showSidebar.bind(this);
		this.hideSidebar=this.hideSidebar.bind(this);
		this.toggleSidebarSize=this.toggleSidebarSize.bind(this);
		this.handleTogglingArrow=this.handleTogglingArrow.bind(this);
		this.handleScreen=this.handleScreen.bind(this);
		this.handleNavs=this.handleNavs.bind(this);

		
		this.handleScreen();
		this.handleNavs();
		
		if (this.state.smallScreen)
			this.hideSidebar();
		store.subscribe(() => {
			
			let type=store.getState().type;
		
			if (type==='SHOW_SIDEBAR')
				this.showSidebar();
			if (type==='HIDE_SIDEBAR')
				this.hideSidebar();
			
			if (type==='ROUTE_CHANGED'){
				this.setState({ activePage: store.getState().page });
			}
			if (type==='AUTH_CHANGE')
				this.handleNavs();

		});
		window.addEventListener('resize',() => {
			this.handleScreen();
		});
		
	}

	render=() => (
		<div class={style.sidebar+this.state.sidebarClass}>
			<header class={style.header}>
				<Link href="/" onClick={this.home}>
					<span>
						<img src="/assets/logo.png" />
						Sports
					</span>
				</Link>
			</header>
			<div class={style.nav}>
				
				<ul>
					{
						this.state.navs.map(i => (
							<div>
								<label>{i[0]}</label>
								{
									i[1].map(j => <Link href={j[1]} title={j[0]}><li class={this.state.activePage===j[1]?style.active:''}><i class={icon(j[2],j[3])} /> <span>{j[0]}</span></li></Link>)
								}
							</div>
						))
					}
				</ul>
				<div class={style.sidebarTogglingArrow} title=" sidebar" onClick={this.handleTogglingArrow}><i class={icon('arrow-left')} /></div>
			</div>
		</div>
	);
	
}

