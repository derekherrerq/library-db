import React, { useContext } from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { AuthContext } from '../Authentication/AuthContext';
import NotificationBell from '../NotificationBell';
import './Navbar.css';

function ActiveListItem(props) {
  return (
    <LinkContainer to={props.url}>
      <Nav.Link active={false}>{props.name}</Nav.Link>
    </LinkContainer>
  );
}

const NavBar = () => {
  const { isAuthenticated, role, logout } = useContext(AuthContext);

  return (
    <Navbar className="main-nav" fluid collapseOnSelect expand="lg">
      {/* Left Section: Library DB */}
      <LinkContainer to="/">
        <Navbar.Brand className="brand-text">Library DB</Navbar.Brand>
      </LinkContainer>
      
      <Navbar.Toggle aria-controls="responsive-navbar-nav">
        <i className="fas fa-bars fa-lg"></i>
      </Navbar.Toggle>
      <Navbar.Collapse id='responsive-navbar-nav'>
        <Nav className='ml-auto'>
          <ActiveListItem url='/' name='Home' />
          {isAuthenticated ? (
            <>
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
            <LinkContainer to='/login'>
              <Nav.Link>
                <button className='button'>Login</button>
              </Nav.Link>
            </LinkContainer>
          )}
        </Nav>

        {/* Right Section: Notification Bell and Logout */}
        {isAuthenticated ? (
          <div className="nav-actions">
            <NotificationBell />
            <Nav.Link onClick={logout}>
              <button className="button">Logout</button>
            </Nav.Link>
          </div>
        ) : (
          <LinkContainer to="/login">
            <Nav.Link>
              <button className="button">Login</button>
            </Nav.Link>
          </LinkContainer>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavBar;
