import { Router } from 'preact-router';
import { handleRoute } from '../../lib';

//PAGES
import Users from './users';
import Tournaments from './tournaments';
import Stocks from './stocks';
import ClassManagement from './class';

const Routes  = () => (
	<Router onChange={handleRoute}>
		<Users path="/admin/users" />
		<Users path="/admin/users/:type" />
		<Tournaments path="/admin/tournaments" />
		<Tournaments path="/admin/tournaments/:type" />
		<Tournaments path="/admin/tournaments/view/:level/:id" />
		<Tournaments path="/admin/tournaments/view/:level/:tid/:id" />
		<Tournaments path="/admin/tournaments/modify/:id" />
		<Tournaments path="/admin/tournaments/generate-fixture/:tid" />
		<Stocks path="/admin/stocks" />
		<Stocks path="/admin/stocks/:any" />
		<ClassManagement path="/admin/attendance" />
		<ClassManagement path="/admin/attendance/:tab" />
	</Router>
);

export default Routes;