import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header>
      <h1>Pillution</h1>
      <nav>
        <Link to="/recommendations">추천</Link>
        <Link to="/cart">장바구니</Link>
      </nav>
    </header>
  );
};

export default Header;
