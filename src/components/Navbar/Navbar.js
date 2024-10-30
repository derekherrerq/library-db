import React, { useContext } from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { AuthContext } from '../Authentication/AuthContext';
import './Navbar.css';

function ActiveListItem(props) {
  // active={false} prevents a link from staying active when on the main page
  return (
    <LinkContainer to={props.url}>
      <Nav.Link active={false}>{props.name}</Nav.Link>
    </LinkContainer>
  );
}

const NavBar = () => {
  const { isAuthenticated, role, logout } = useContext(AuthContext);

  return (
    <Navbar className='main-nav' fluid collapseOnSelect expand='lg'>
      <LinkContainer to='/'>
        <Navbar.Brand className='brand-text'>
          Library DB
        </Navbar.Brand>
      </LinkContainer>
      <Navbar.Toggle aria-controls='responsive-navbar-nav'>
        <i className='fas fa-bars fa-lg'></i>
      </Navbar.Toggle>
      <Navbar.Collapse id='responsive-navbar-nav'>
        <Nav className='ml-auto'>
          {isAuthenticated ? (
            <>
              <ActiveListItem url='/' name='Home' />
              <ActiveListItem url='/search' name='Search' />
              {role === 'admin' && (
                <ActiveListItem url='/admin-dashboard' name='Admin Dashboard' />
              )}
              {role === 'staff' && (
                <ActiveListItem url='/staff-dashboard' name='Staff Dashboard' />
              )}
              <ActiveListItem url='/user-dashboard' name='User Dashboard' />
              <Nav.Link onClick={logout}>
                <button className='button'>Logout</button>
              </Nav.Link>
            </>
          ) : (
            <>
              <LinkContainer to='/login'>
                <Nav.Link>
                  <button className='button'>Login</button>
                </Nav.Link>
              </LinkContainer>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavBar;