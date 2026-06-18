/* 
* <license header>
*/

import React from 'react'
import { NavLink } from 'react-router-dom'

function SideBar () {
    return (
        <ul className="SideNav">
            <li className="SideNav-item">
                <NavLink
                    className={({ isActive }) => `SideNav-itemLink ${isActive ? 'is-selected' : ''}`}
                    aria-current="page"
                    end
                    to="/"
                >
                    Home
                </NavLink>
            </li>
            <li className="SideNav-item">
                <NavLink
                    className={({ isActive }) => `SideNav-itemLink ${isActive ? 'is-selected' : ''}`}
                    aria-current="page"
                    to="/actions"
                >
                    Your App Actions
                </NavLink>
            </li>
            <li className="SideNav-item">
                <NavLink
                    className={({ isActive }) => `SideNav-itemLink ${isActive ? 'is-selected' : ''}`}
                    aria-current="page"
                    to="/shopify-customers"
                >
                    Customers
                </NavLink>
            </li>
            <li className="SideNav-item">
                <NavLink
                    className={({ isActive }) => `SideNav-itemLink ${isActive ? 'is-selected' : ''}`}
                    aria-current="page"
                    to="/adobe-products"
                >
                    Adobe SKU Lookup
                </NavLink>
            </li>
            <li className="SideNav-item">
                <NavLink
                    className={({ isActive }) => `SideNav-itemLink ${isActive ? 'is-selected' : ''}`}
                    aria-current="page"
                    to="/state-storage"
                >
                    State Storage
                </NavLink>
            </li>
            <li className="SideNav-item">
                <NavLink
                    className={({ isActive }) => `SideNav-itemLink ${isActive ? 'is-selected' : ''}`}
                    aria-current="page"
                    to="/file-storage"
                >
                    File Storage
                </NavLink>
            </li>
        </ul>
    )
}

export default SideBar
