import { h, Component } from 'preact';
import style from './style';
import * as firebase from 'firebase';
import { Link, Router }  from 'preact-router';
import { store,input,empty,Info,classList,convertToDate,Country } from '../../../lib';

class DeleteItem extends Component{
	
	handleDelete(){
		this.setState({ deleteItem: this.props.id });
	}
	closeDelete(){
		this.setState({ deleteItem: null });
	}
	confirmDelete(){
		this.closeDelete();
		firebase.firestore().doc('stocks/'+this.props.id).set({ show: false,removedBy: firebase.auth().currentUser.phoneNumber },{ merge: true }).then(() => {
			this.props.onClick('SUCCESS');
			
		},
		(e) => {
			this.props.onClick(e.message);
			
		});
	}
	constructor(props){
		super(props);
		this.handleDelete=this.handleDelete.bind(this);
		this.closeDelete=this.closeDelete.bind(this);
		this.confirmDelete=this.confirmDelete.bind(this);
	}
	componentWillReceiveProps(newProps){
		this.props=newProps;
	}
	
	render(){
		return (
			<span>
				<span class={style.button} onClick={this.handleDelete}>
					DELETE
				</span>
				{this.state.deleteItem?
					<div class={style.dialog}>
						<div class={style.head}>Warning!</div>
						<div>
							Are you sure you want to delete {this.state.deleteItem}?
						</div>
						<div>
							<span class={style.button}  onClick={this.confirmDelete}>YES</span>
							<span class={classList([style.button,style.floatRight])} onClick={this.closeDelete}>No</span>
						</div>
					</div>
					:''}
			</span>);
	}
}

export default class Stocks extends Component {
	tabs=[
		['View Stock','/admin/stocks'],
		['Lent items','/admin/stocks/lent-items'],
		['Purchases','/admin/stocks/purchases'],
		['Add/Modify item','/admin/stocks/add-item']
	];
	
	handleRoute(e){
		
		this.setState({ url: e.current.attributes.path });
		
	}
	constructor(props){
		super(props);
		this.handleRoute=this.handleRoute.bind(this);
		
	}
	render() {
		
		return (
			<div>
				<div class={style.title}>Stock</div>
				<div class={style.tabs}>
					{
						this.tabs.map(i => <Link href={i[1]} class={this.state.url===i[1]?'active':''}>{i[0]}</Link>)
					}
				</div>
					
				<div class={style.card+' '+style.regForm}>
					<Router onChange={this.handleRoute}>
						<AddItem path="/admin/stocks/add-item" />
						<Purchases path="/admin/stocks/purchases" />
						<LentItems path="/admin/stocks/lent-items" />
						<ViewStock path="/admin/stocks" default />
						
					</Router>
					
				
				</div>
			</div>
			
		);
	}
}

class AddItem extends Component{
	state={
		button: 'Add',
		items: []
	}
	
	add(e){
		e.preventDefault();
		this.setState({ button: 'Adding...' });
		try {
			if (empty(this.state.itemName))
				throw 'Please enter an item name';
			firebase.firestore().collection('stock_items').doc(this.state.itemName).set({
				itemName: this.state.itemName,
				show: true
			}).then(() => {
				this.setState({ infoType: 'success',infoMessage: 'Item has been added successfully.',button: 'Add',itemName: '' });
			},(e) => {
				this.setState({ infoType: 'error',infoMessage: 'Failed to add item. Reason: '+e.message,button: 'Add' });
			});
		}
		catch (msg){
			this.setState({ infoMessage: msg,infoType: 'error',button: 'Add' });
		}
	}
	handleDeleteItem(m){
		
	}
	constructor(props){
		super(props);
		this.add=this.add.bind(this);
		store.dispatch({ type: 'FORM_CHANGE',form: this });
		firebase.firestore().collection('stock_items').where('show','==',true).orderBy('itemName','asc').onSnapshot((d) => {
			this.setState({ items: d.docs });
			
		});
	}
	render(){
		return (<form onSubmit={this.add}>
			
			<div>
				<Info that={this} />
				
			</div>
			<table class={style.overflowTable}>
				<tr>
					<th />
					<th>Item Name</th>
					<th>&nbsp;</th>
				</tr>
				<tr>
					<th />
					<th>
						<input type="text" name="itemName" value={this.state.itemName} onChange={input} />
					</th>
					<th><button>{this.state.button}</button></th>
				</tr>
				{
					this.state.items.map((d,i) => <tr><td>{i+1}.</td><td>{d.data().itemName}</td><td><DeleteItem onClick={this.handleDeleteItem}  id={d.id} /></td></tr>)
				}
			</table>
		</form>);
	}
}


class Purchases extends Component{
	state={
		button: 'Add',
		purchases: [],
		items: []
	}
	
	add(e){
		e.preventDefault();
		this.setState({ button: 'Adding...' });
		try {
			if (empty(this.state.itemName))
				throw 'Please select an item name';
			if (empty(this.state.date))
				throw 'Please enter date';
			if (empty(this.state.vendor))
				throw 'Please enter vendor details';
			if (empty(this.state.units))
				throw 'Please enter units';
			if (this.state.hasWarranty&&empty(this.state.warranty_date))
				throw 'Please enter warranty expiry date';
				
			let data={
				itemName: this.state.itemName,
				date: (new Date(this.state.date)).getTime(),
				show: true,
				vendor: this.state.vendor,
				units: this.state.units
			};
		
			if (this.state.hasWarranty){
				data.hasWarranty=true;
				data.warranty_date=(new Date(this.state.warranty_date)).getTime();
			}
			
			firebase.firestore().collection('purchases').add(data).then(() => {
				this.setState({ infoType: 'success',infoMessage: 'Purchase has been saved successfully.',button: 'Add',itemName: '' });
			},(e) => {
				this.setState({ infoType: 'error',infoMessage: 'Failed to save transaction. Reason: '+e.message, button: 'Add' });
			});
		}
		catch (msg){
			
			this.setState({ infoMessage: msg,infoType: 'error',button: 'Add' });
		}
	}
	handleDeleteItem(m){
		
	}
	constructor(props){
		super(props);
		this.add=this.add.bind(this);
		store.dispatch({ type: 'FORM_CHANGE',form: this });
		firebase.firestore().collection('stock_items').where('show','==',true).orderBy('itemName','asc').onSnapshot((d) => {
			this.setState({ items: d.docs });
		});
		firebase.firestore().collection('purchases').where('show','==',true).orderBy('date','desc').onSnapshot((d) => {
			this.setState({ purchases: d.docs });
		});
	}
	render(){
		return (<form onSubmit={this.add}>
			
			<div>
				<Info that={this} />
				
			</div>
			<table class={style.overflowTable}>
				<tr><th />
					<th>Item</th>
					<th>Date</th>
					<th>Vendor</th>
					<th>Units</th>
					<th>Warrenty Period</th>
					<th>&nbsp;</th>
				</tr>
				<tr>
					<th />
					<th>
						<select name="itemName" value={this.state.itemName} onChange={input}>{
							this.state.items.map((d,i) => <option value={d.id}>{d.data().itemName}</option>)
						}</select>
					</th>
					<th>
						<input type="date" name="date" onChange={input} value={this.state.date} />
					</th>
					<th>
						<input class={style.long} name="vendor" onChange={input} value={this.state.vendor} />
					</th>
					<th>
						<input type="number" class={style.short} name="units" onChange={input} value={this.state.units} />
					</th>
					<th>
						<input type="checkbox" name="hasWarranty" onChange={input} value={this.state.hasWarranty} />
						{this.state.hasWarranty?<input type="date" name="warranty_date" value={this.state.warranty_date} onChange={input} />:''}
					</th>
					<th><button>{this.state.button}</button></th>
				</tr>
				{
					this.state.purchases.map((d,i) => <tr><td>{i+1}.</td><td>{d.data().itemName}</td><td>{convertToDate(d.data().date)}</td><td>{d.data().vendor}</td><td>{d.data().units}</td><td>{convertToDate(d.data().warranty_date)}</td><td /></tr>)
				}
			</table>
		</form>);
	}
}

class ViewStock extends Component{
	state={
		button: 'Add',
		items: [],
		counts: {}
	}
	constructor(props){
		super(props);
		store.dispatch({ type: 'FORM_CHANGE',form: this });
		firebase.firestore().collection('stock_items').where('show','==',true).orderBy('itemName','asc').onSnapshot((d) => {
			d.forEach(i => {
				let counts = this.state.counts;
				counts[i.id]=[0,0];
				this.setState({ counts });
				firebase.firestore().collection('purchases').where('itemName','==',i.id).onSnapshot(d => {
					d.forEach(k => {
						let counts = this.state.counts;
						counts[i.id][0]+=Number(k.data().units);
						this.setState({ counts });
					});
				
				});
				firebase.firestore().collection('lent_items').where('itemName','==',i.id).onSnapshot(d => {
					d.forEach(k => {
						let counts = this.state.counts;
						counts[i.id][1]+=Number(k.data().units);
						this.setState({ counts });
					});
				
				});
			});
		});
	}

	
	render(){
		
		return (<form onSubmit={this.add}>
			
			<div>
				<Info that={this} />
				
			</div>
			<table class={classList([style.overflowTable,style.statTable])}>
				<tr><th />
					<th>Item</th>
					<th>Total</th>
					<th>Lent</th>
					<th>Available</th>
				</tr>
				{
					Object.keys(this.state.counts).map((d,i) => <tr><td>{i+1}.</td><td>{d}</td><td>{this.state.counts[d][0]}</td><td>{this.state.counts[d][1]}</td><td>{this.state.counts[d][0]-this.state.counts[d][1]}</td></tr>)
				}
			</table>
		</form>);
	}
}

class LentItems extends Component{
	state={
		button: 'Add',
		lent_items: [],
		items: [],
		phone: ['India','in',91,'+.. .....-.....'],
		phoneNumber: 91,
		counts: {}
	}
	
	add(e){
		e.preventDefault();
		this.setState({ button: 'Adding...' });
		try {
			if (empty(this.state.itemName))
				throw 'Please select an item name';
			if (empty(this.state.date))
				throw 'Please enter date';
			if (empty(this.state.borrower))
				throw 'Please enter borrower details';
			if (!this.state.phoneNumber||isNaN(this.state.phoneNumber))
				throw 'Invalid phone number';
			if (this.state.phoneNumber.length!==this.state.phone[3].match(/\./g).length)
				throw 'Does not appear as a phone number from '+this.state.phone[0];
			if (empty(this.state.units))
				throw 'Please enter units';
			if (empty(this.state.return_date))
				throw 'Please enter return date';
			//console.log(this.state.counts[this.state.itemName][0],this.state.counts[this.state.itemName][1],Number(this.state.units));
			if ((this.state.counts[this.state.itemName][0]-this.state.counts[this.state.itemName][1]-Number(this.state.units))<=0)
				throw 'Only '+(this.state.counts[this.state.itemName][0]-this.state.counts[this.state.itemName][1])+' units of '+this.state.itemName+' available.';

			let data={
				itemName: this.state.itemName,
				date: (new Date(this.state.date)).getTime(),
				show: true,
				borrower: this.state.borrower,
				phoneNumber: this.state.phoneNumber,
				units: this.state.units,
				return_date: (new Date(this.state.return_date)).getTime()
			};
			
			
			firebase.firestore().collection('lent_items').add(data).then(() => {
				this.setState({ infoType: 'success',infoMessage: 'Purchase has been saved successfully.',button: 'Add',itemName: '' });
			},(e) => {
				this.setState({ infoType: 'error',infoMessage: 'Failed to save transaction. Reason: '+e.message,button: 'Add' });
			});
		}
		catch (msg){
			//console.log(msg);
			this.setState({ infoMessage: msg,infoType: 'error',button: 'Add' });
		}
	}
	handleDeleteItem(m){
		//console.log(m);
	}
	constructor(props){
		super(props);
		this.add=this.add.bind(this);
		store.dispatch({ type: 'FORM_CHANGE',form: this });
		firebase.firestore().collection('stock_items').where('show','==',true).orderBy('itemName','asc').onSnapshot((d) => {
			this.setState({ items: d.docs });
		});
		firebase.firestore().collection('lent_items').where('show','==',true).orderBy('date','desc').onSnapshot((d) => {
			this.setState({ lent_items: d.docs });
		});


		firebase.firestore().collection('stock_items').where('show','==',true).orderBy('itemName','asc').onSnapshot((d) => {
			d.forEach(i => {
				let counts = this.state.counts;
				counts[i.id]=[0,0];
				this.setState({ counts });
				firebase.firestore().collection('purchases').where('itemName','==',i.id).onSnapshot(d => {
					d.forEach(k => {
						let counts = this.state.counts;
						counts[i.id][0]+=Number(k.data().units);
						this.setState({ counts });
					});
				
				});
				firebase.firestore().collection('lent_items').where('itemName','==',i.id).onSnapshot(d => {
					d.forEach(k => {
						let counts = this.state.counts;
						counts[i.id][1]+=Number(k.data().units);
						this.setState({ counts });
					});
				
				});
			});
		});
	}
	render(){
		return (<form onSubmit={this.add}>
			
			<div>
				<Info that={this} />
				
			</div>
			<table class={style.overflowTable}>
				<tr>
					<th />
					<th>Item</th>
					<th>Date</th>
					<th>Borrower</th>
					<th>Phone Number</th>
					<th>Units</th>
					<th>Return Date</th>
					<th>&nbsp;</th>
				</tr>
				<tr>
					<th />
					<th>
						<select name="itemName" value={this.state.itemName} onChange={input}>{
							this.state.items.map((d,i) => <option value={d.id}>{d.data().itemName}</option>)
						}</select>
					</th>
					<th>
						<input type="date" name="date" onChange={input} value={this.state.date} />
					</th>
					<th>
						<input class={style.long} name="borrower" onChange={input} value={this.state.borrower} />
					</th>
					<th>
						<Country that={this} name="phoneNumber" />
					</th>
					<th>
						<input type="number" class={style.short} name="units" onChange={input} value={this.state.units} />
					</th>
					<th>
						
						<input type="date" name="return_date" value={this.state.return_date} onChange={input} />
					</th>
					<th><button>{this.state.button}</button></th>
				</tr>
				{
					this.state.lent_items.map((d,i) => <tr><td>{i+1}.</td><td>{d.data().itemName}</td><td>{convertToDate(d.data().date)}</td><td>{d.data().borrower}</td><td>{d.data().phoneNumber}</td><td>{d.data().units}</td><td>{convertToDate(d.data().return_date)}</td><td /></tr>)
				}
			</table>
		</form>);
	}
}