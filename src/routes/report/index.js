import { h, Component } from 'preact';
import style from './style';
import * as firebase from 'firebase';
import countries from '../../lib/countries';
import { Info, icon } from '../../lib';
class Flag extends Component{
	
	handleClick(){
		this.props.onClick(this.props.id);
	}
	constructor(props){
		super(props);
		this.handleClick=this.handleClick.bind(this);

	}
	componentWillReceiveProps(newProps){
		this.props=newProps;
	}
	
	render(){
		return <div onClick={this.handleClick}><i class={'flag '+this.props.id[1]} /> {this.props.id[0]} (+{this.props.id[2]})</div>;
	}
}

export default class Report extends Component {
	
	state={

		img: [],

		participantsList: [],
		
		
		phone: ['India','in',91,'+.. .....-.....'],
		phoneNumber: 91
	}
	
	handleForm(event){
		let node=event.target;
		this.setState({ [node.name]: node.value });
	}
	handleISDCode(){
		this.setState({ showList: !this.state.showList });
	}
	setISD(e){
		
		this.setState({ phone: e,phoneNumber: e[2],showList: false });
	}
	openFileSelector(){
		document.querySelector('[name=images]').click();
	}
	handleFile(e){
		//console.log(e);
		
		this.setState({ [e.target.name]: e.target.value,img: [] });
		for (let i=0;i<e.target.files.length;i++)
			this.upload(e.target.files[i]);
	}
	upload(file){
		let reader = new FileReader();
		reader.onload =  (e) => {
			// get loaded data and render thumbnail.
			if (!(file.type==='image/png'||file.type==='image/jpeg')){
				//alert('Invalid Format');
				return;
			}
			this.state.img.push(e.target.result);
			this.setState({ img: this.state.img });
			let firestore = firebase.firestore();
			let type=file.type.substr(6);
			let data={
				time: Math.floor(Date.now()/1000),
				type
			};
			firestore.collection('reports').add(data).then((doc) => {
				this.setState({ id: doc.id });
				let ref= firebase.storage().ref('reports/screenshots/'+doc.id+'.'+type);
				let task = ref.put(file);
				task.on('state_changed',
					(progress) => {
						e.target.innerHTML='Uploading...';
						//console.log('progress',progress);
					},
					(error) => {
						//alert('Some error occured while uploading\n'+error);
					},
					(success) => {
						//console.log('success',success);
						ref.getDownloadURL().then((d) => {
							//console.log(d);
							data.url=d;
							firestore.doc('reports/'+doc.id).set(data);
						},(e) => {
							//console.log(e);
						});
						
					}
				);
			});
			
		};
		reader.readAsDataURL(file);
	}
	report(e){
		e.preventDefault();
		let ref = firebase.firestore().collection('reports');
		let data={
			name: this.state.name,
			message: this.state.message,
			phoneNumber: this.state.phoneNumber
		};
		let res=null;
		if (this.state.id)
			res = ref.doc(this.state.id).set(data,{ merge: true });
		else
			res = ref.add(data);

		res.then(i => this.setState({ infoType: 'success',infoMessage: 'Thank you for the feedback :)' }),
				 e => this.setState({ infoType: 'error',infoMessage: e.message }));
		
	}
	constructor(props){
		super(props);
		this.handleForm=this.handleForm.bind(this);
		this.handleISDCode=this.handleISDCode.bind(this);
		this.setISD=this.setISD.bind(this);
		this.handleFile=this.handleFile.bind(this);
		this.report=this.report.bind(this);
	}
	render() {
		
		return (
			<div class={style.report}>
				<div class={style.title}>Report a bug</div>
					
				<form onSubmit={this.report}>
					<div class={style.card}>
						<Info that={this} />
						<div>
							This web app is in beta version, so chances are you have found some flaws in the website.
							We need your help to make sure that our system is bug free.
							If you find something wrong in the website please let us know.
							We would also like to hear feedback from you so that we can develop our service.
						</div>
						<div>
							<b> Your name* : </b>
							<input type="text" name="name" onchange={this.handleForm} />
						</div>
						<div>
							<b> Your phone number* : </b>
							<div class={style.phoneInput+' f32'}>
								<div class={style.selected} onClick={this.handleISDCode}>
									<i class={'flag '+this.state.phone[1]} /><i class={icon('caret-down')} />+
								</div>
								<div>
									<input type="number" name="phoneNumber" value={this.state.phoneNumber} onKeyUp={this.handleForm} autocomplete="off" />
								</div>
								{this.state.showList?
									<div class={style.countries_list+' f32'}>
										{countries.map(i =>
											<Flag id={i} onClick={this.setISD} />
										)}
									</div>
									:
									''
								}
							</div>
						</div>
						<div>
							Message:
							<textarea name="message" onchange={this.handleForm} />
						</div>
						<div>
							<span class={style.button} onClick={this.openFileSelector}>Add screenshots <i class={icon('image')} /></span>
							<input type="file" class={style.hide} name="images" onChange={this.handleFile} multiple />
							
						</div>
						<div class={style.imgs}>{
							this.state.img.map(i => <img src={i} />)
						}</div>
						<div>
							<button>Send</button>
						</div>
					</div>
				</form>
				
				
			</div>
			
		);
	}
}
