import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => (
	<div>
		<MetaData {...meta}>
			<meta name='prerender-status-code' content='404'></meta>
		</MetaData>

		<div className='fourOfour'>
			<h1>
				404
			</h1>
		</div>
		<div className='return'>
			<p>Page Not Found</p>
			<button>
				<Link to='/'>Return Home</Link>
			</button>
		</div>
	</div>
);

export default NotFound;
