import React, { useState } from 'react'
import { navLinks } from '../constants/index.js';
import { VscMenu, VscClose } from 'react-icons/vsc';

const NavBar = () => {
  const [toggleMenu, setToggleMenu] = useState(false);

  return (
    <nav className='w-full flex py-6 justify-between items-center navbar'>
      <h3 className='w-[124px] h-[32px] text-white'>ENS</h3>

      <ul className='list-none sm:flex hidden justify-end items-center flex-1'>
        {
          navLinks.map(
            (nav, idx) => (
              <li key={nav.id} className={
                `font-poppins font-normal 
                cursor-pointer 
                text-[16px] text-white
                ${idx === navLinks.length - 1 ? `mr-0` : `mr-10`}`
              }>
                <a href={`#${nav.id}`}>{nav.title}</a>
              </li>
            )
          )
        }
      </ul>

      <div className="sm:hidden flex flex-1 justify-end items-center text-white">
        <span 
          className='w-[28px] h-[28px] object-contain' 
          onClick={() => setToggleMenu((prev) => !prev)}>{ toggleMenu ? <VscClose /> : <VscMenu />
        }</span>
        
        <div className={
          `${toggleMenu ? 'flex' : 'hidden'} 
          p-6 mx-4 my-2 absolute top-20 right-0 min-w-[140px] 
          rounded-xl sidebar bg-black-gradient`
        }>
          <ul className='list-none flex flex-col justify-end items-center flex-1'>
            {
              navLinks.map(
                (nav, idx) => (
                  <li key={nav.id} className={
                    `font-poppins font-normal 
                    cursor-pointer 
                    text-[16px] text-white
                    ${idx === navLinks.length - 1 ? `mr-0` : `mb-4`}`
                  }>
                    <a href={`#${nav.id}`}>{nav.title}</a>
                  </li>
                )
              )
            }
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default NavBar