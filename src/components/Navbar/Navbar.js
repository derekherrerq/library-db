import React, { useContext } from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { AuthContext } from '../Authentication/AuthContext';
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
    <Navbar className="main-nav" fluid collapseOnSelect expand="lg">
      <div className="navbar-left">
        <Navbar.Toggle aria-controls="responsive-navbar-nav">
          <i className="fas fa-bars toggle-icon"></i>
        </Navbar.Toggle>
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="left-nav">
            <ActiveListItem url="/" name="Home" />
            {role === 'Admin' && <ActiveListItem url="/admin-dashboard" name="Admin Dashboard" />}
            {role === 'Staff' && <ActiveListItem url="/staff-dashboard" name="Staff Dashboard" />}
            <ActiveListItem url="/user-dashboard" name="User Dashboard" />
          </Nav>
        </Navbar.Collapse>
      </div>
      
      <div className="navbar-center">
        <LinkContainer to="/">
          <Navbar.Brand className="brand-text">
            <i className="fas fa-book-open brand-icon"></i> Library DB
          </Navbar.Brand>
        </LinkContainer>
      </div>

      {isAuthenticated && (
        <div className="navbar-right">
          <Nav className="ml-auto">
            <Nav.Link onClick={logout} className="nav-link-custom logout-button">
              Logout
            </Nav.Link>
          </Nav>
        </div>
      )}
    </Navbar>
  );
};

export default NavBar;
