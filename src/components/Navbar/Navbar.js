import React, { useContext } from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { AuthContext } from '../Authentication/AuthContext';
import NotificationBell from './NotificationBell/NotificationBell';
import './Navbar.css';

function ActiveListItem({ url, name }) {
  return (
    <LinkContainer to={url}>
      <Nav.Link active={false} className="nav-link-custom">
        {name}
      </Nav.Link>
    </LinkContainer>
  );
}

const NavBar = () => {
  const { isAuthenticated, role, logout } = useContext(AuthContext);

  return (
    <Navbar className="main-nav" expand="md">
      <div className="navbar-left">
        {isAuthenticated && (
          <Nav className="left-nav">
            <ActiveListItem url="/" name="Home" />
            {role === 'Admin' && <ActiveListItem url="/admin-dashboard" name="Admin Dashboard" />}
            {role === 'Staff' && <ActiveListItem url="/staff-dashboard" name="Staff Dashboard" />}
            <ActiveListItem url="/user-dashboard" name="User Dashboard" />
          </Nav>
        )}
      </div>

      <div className="navbar-center">
        <LinkContainer to="/">
          <Navbar.Brand className="brand-text">
            <i className="fas fa-book-open brand-icon"></i> Library DB
          </Navbar.Brand>
        </LinkContainer>
      </div>

      <div className="navbar-right">
        <Nav className="ml-auto">
          {isAuthenticated && (
            <>
              <NotificationBell />
              <Nav.Link onClick={logout} className="nav-link-custom logout-button">
                Logout
              </Nav.Link>
            </>
          )}
        </Nav>
      </div>
    </Navbar>
  );
};

export default NavBar;
