import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
    return (
        <nav>
            <ul>
                <li>
                    <Link>Link</Link>
                </li>
                <li>
                    <Link>Link</Link>
                </li>
                <li>
                    <Link>Link</Link>
                </li>
            </ul>
        </nav>
    );
}

export default NavBar;