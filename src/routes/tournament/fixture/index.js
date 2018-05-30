import { h, Component } from 'preact';
import style from './style';
import * as firebase from 'firebase';
import { convertToDate } from '../../../lib';

export default class Fixture extends Component {
	state={
		teams: [],
		pattern: [],
		fixtureMap: {},
		fixtureMap2: {},
		maxTextLength: 0,
		title: '',
		width: 0,
		fix: []
	}
	div=(n) => {
		let mid = n/2;
		if (n%2!==0)
			mid = Math.ceil(mid);
		return mid;
	}
	
	
	teams_b=(n) => {
		let team = '.'.repeat(n).split('').map((i,j) => j+1);
		let b=2;
		let p=1;
		while (b<n){
			b*=2;
			p++;
		}
		b=b-n;
	
		let x= this.select_bice(team,0,b,[]);
	   
		let f=[];
		let fix=[];
		
		for (let i=0;i<team.length;i++){
			let flag=1;
			for (let j=0;j<x.length;j++)
				if (x[j]===team[i])
					flag=0;
					
				
			if (flag)
				f.push(team[i]);
		}
	   
	   fix[0]=[];
		for (let i=0;i<team.length;i++){
			let flag=0;
			for (let j=0;j<x.length;j++){
				if (team[i]===x[j])
					flag=1;
			}
			if (!flag)
				fix[0].push([team[i],team[++i]]);
			else
				fix[0].push([team[i]]);
		}
	   
		
		for (let l=1;l<p;l++){
			let k=0;
			fix[l]=[];
			for (let i=0;i<fix[l-1].length;i+=2){
				fix[l][k++]=[i+1,i+2];
			}
		}

		/*
		for(let i=0;i<team.length;i++){
			let flag=0;
			for(let j=0;j<x.length;j++){
				if(team[i]==x[j])
					flag=1;
			}
			if(!flag)
				fix.push([team[i],team[++i]]);
			else
				fix.push(team[i]);
		}
	   */
	   return fix;
	   
	
	}
	
	select_bice=(team,p,b,exc) => {

		if (b-->0)
			exc.push(team[team.length-1-p]);
		if (b-->0)
			exc.push(team[p+0]);
		
		let d = this.div(team.length);
	
		if (b-->0)
			exc.push(team[d+p]);
		if (b-->0)
			exc.push(team[d-p-1]);
		if (b>0)
			exc=this.select_bice(team,p+1,b,exc);
		return exc;
	}
	set(n){
		
		let e=[];
		if (n%2===0){
			let k=0;
			while (k!==n)
				e.push([++k,++k]);
		}
		else {
			let b = 2;
			while (b<n)
				b*=2;
			//let less = b-n;
			let i = 1;
			while (i<Math.ceil(n/2))
				e.push([i++]);
			e.push([Math.ceil(n/2),Math.ceil(n/2)+1]);
			i++;
			while (i<n)
				e.push([++i]);
			
		}
		console.log(e);
		console.log(1,this.teams_b(n));
		return e;
		
		//return this.teams_b(n);
			
	}
	constructor(props){
		super(props);
		let ref=firebase.firestore().collection('tournaments').doc(this.props.tournament);
		ref.onSnapshot(d => {
			//console.log(d.data().startDate);
			this.setState({ title: d.data().title,start: convertToDate(d.data().startDate) });
		});
		ref.collection('registered_teams').onSnapshot(col => {
			let total=col.size;


			let teams = [];
			col.docs.map(i => {
				let text = i.data().year+' '+i.data().course+' '+i.data().section;
				if (text.length> this.state.maxTextLength)
					this.setState({ maxTextLength: text.length });
				teams.push(text);
			});
			let fixtureMap={};
			let fixtureMap2={};
			let t=total;
			//let pattern=[];
			let fix = this.teams_b(t);
			if (fix.length)
				for (let g=0;g<fix.length;g++){
					//let s = this.set(t);
					//console.log('T',t,s.length);
					//let c=0;
					//s.map(i=>i.length==2?c++:false);
					//t-=c;//5
					//let round = pattern.length;
					//console.log('P','t'+t,s);
					fixtureMap2[g]={};
					//pattern.push(s);
					let k=0;
					console.log('g',g,fix,fixtureMap2);
					fix[g].map((i,j) => {
					//	console.log(round,k,j,i,fixtureMap,pattern)
						//console.log(round,k,i,fixtureMap);
						console.log('i',i,g);
						if (g===0){

							
							//console.log("round 0")
							//fixtureMap[round][k++]=i[0]*50
							let start = (i[0]-1)*50+25+15;
							console.log(i);
							let end = start+50;
							if (i.length=== 1 )
								fixtureMap2[g][k++]=[start];
							else
								fixtureMap2[g][k++]=[start,end];
						}
						else {

							let teamA = i[0]-1;
							if (i.length===1){
								fixtureMap2[g][k++]=[fixtureMap2[g-1][teamA][0]];
								return;
							}
							
							
							let teamB = i[1]-1;
							console.log('f',teamA);
							
							let teamAMid = fixtureMap2[g-1][teamA].length===2?(fixtureMap2[g-1][teamA][1] + fixtureMap2[g-1][teamA][0])/2:fixtureMap2[g-1][teamA][0];
							//console.log('fixtureMap2['+(round-1)+']['+teamB+'][1]',fixtureMap2,pattern,round,j);
							let teamBMid = fixtureMap2[g-1][teamB].length===2?(fixtureMap2[g-1][teamB][1] + fixtureMap2[g-1][teamB][0])/2:fixtureMap2[g-1][teamB][0];
							fixtureMap2[g][k++]=[teamAMid,teamBMid];

							/*fixtureMap2[round][k++]=[i[0]*50+25+15,i[0]*50+25+15+50];
							console.log('round' +round);
							//fixtureMap[round][k++]=(fixtureMap[round-1][pattern[round][j][0]-1]+fixtureMap[round-1][pattern[round][j][1]-1])/2||i[0]*50+25+15;
							*/
						}
					});
				}
			//console.log(this.state.maxTextLength,pattern.length);
			let width1 = (this.state.maxTextLength*11)+(60*fix.length)+50;
			let width2 = this.state.title.length*11;
			
			this.setState({ total: col.size,teams,fix,fixtureMap,fixtureMap2,width: width1>width2?width1:width2 });
			//console.log(this.state);
			
		});
	}
	
	componentDidUpdate(){
		let svg = document.querySelector('svg');
		let link = document.querySelector('#download');
		let image = svg.outerHTML.replace('</svg>','')+svg.innerHTML+'</svg>';
		link.href='data:image/svg+xml,'+image;
	}
	render(){
		return (
			<div class={style.card}>
				<h1>Fixture</h1>
				<a href="" class={style.button} id="download" download={Date.now()+'.svg'}>Download</a>
				<div>
				Total Teams: {this.state.total}
				</div>
				<svg xmlns="http://www.w3.org/2000/svg" height={this.state.total*60} width={this.state.width} style={'min-width:'+this.state.title.length*11}>
					<text x={this.state.width/2} y={15} stroke="black"  text-anchor="middle">Fixtures for {this.state.title}</text>

					{
						this.state.fix.map((i,j) =>
						
							i.map((k,l) => this.state.fixtureMap2[j][l].length===2?<a>
								<line x1={this.state.maxTextLength*11+10+50+(j*60)} y1={this.state.fixtureMap2[j][l][0]} x2={this.state.maxTextLength*11+10+50+(j*60)} y2={this.state.fixtureMap2[j][l][1]} style="stroke:#000;stroke-width:2" />
								<line x1={this.state.maxTextLength*11+10+(j*60)} y1={this.state.fixtureMap2[j][l][0]} x2={this.state.maxTextLength*11+10+50+(j*60)} y2={this.state.fixtureMap2[j][l][0]} style="stroke:#000;stroke-width:2" />
								<line x1={this.state.maxTextLength*11+10+(j*60)} y1={this.state.fixtureMap2[j][l][1]} x2={this.state.maxTextLength*11+10+50+(j*60)} y2={this.state.fixtureMap2[j][l][1]} style="stroke:#000;stroke-width:2" />
							</a>:<line x1={this.state.maxTextLength*11+10+(j*60)} y1={this.state.fixtureMap2[j][l][0]} x2={this.state.maxTextLength*11+10+50+(j*60)} y2={this.state.fixtureMap2[j][l][0]} style="stroke:#000;stroke-width:2" />
							)
						)
					}
					{
						this.state.teams.map((i,j) => (<a>
						
							<rect width={this.state.maxTextLength*11+'px'} height="30px" x="10px" y={50*j+25+'px'} style="fill:white;stroke-width:3;stroke:rgb(0,0,0)" />
							<text x={this.state.maxTextLength*6} y={50*j+45} stroke="black"  text-anchor="middle">{i}</text>
						</a>))
					
					
					}
				
				</svg>
			</div>)
		;
	}
}