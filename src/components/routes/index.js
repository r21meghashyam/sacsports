import { h, Component } from 'preact';
import { Link, Router } from 'preact-router';
import style from './style';

export default class Routes  extends Component{
	state = {
		path: '/'
	}
	changePath(e){
		this.setState({ path: e.active[0].attributes.path });
	}
	constructor(props){
		super(props);
		this.changePath=this.changePath.bind(this);
		
	}
	render = ({ children }) => (
		<div>
			<div class={style.tabs}>
				{
					children.filter(i => !i.attributes.hideNav).map(i => <Link href={i.attributes.path} class={this.state.path===i.attributes.path?style.active:''}>{i.attributes.title}</Link>)
				}
			</div>
			<Router onChange={this.changePath}>
				{
					this.props.children
				}
			</Router>
		</div>
	);
}