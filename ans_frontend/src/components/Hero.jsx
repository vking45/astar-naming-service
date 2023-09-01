import styles from '../styles';
import React from 'react';

import { VscSearch } from 'react-icons/vsc';

const Hero = () => {
  return (
    <section id='home' className={`flex md:flex-row flex-col ${styles.paddingY}`}>
      <div className={`flex-1 ${styles.flexStart} flex-col xl:px-0 sm:px-16 px-6`}>
        {/* <div className={`flex flex-row items-center py-[6px] px-4 bg-discount-gradient rounded-[10px] mb-2`}>
          <p className={`${styles.paragraph}`}>
            <span className={`text-white`}>
              Identifying Your Crypo Addresses is Now Easier
            </span>
          </p>
        </div> */}

        <div className={`flex flex-row justify-between items-center w-full`}>
          <h1 className='flex-1 font-poppins font-semi-bold ss:text-[72px] text-[52px] text-white ss:leading-[100px] leading-[75px]'>
            APPNAME <br className='sm:block hidden'/> {' '}
            <span className='text-gradient'>DNS for Web3</span> {' '}
          </h1>
        </div>
        
        <p className={`${styles.paragraph} max-w-[500px] mt-5`}>
          Your identity across Web3, one name for all all your crypto addresses, and your decentralized website.
        </p>
      </div>

      <div className={`flex-1 flex ${styles.flexCenter} flex-col md:my-0 my-10 relative`}>
        {/* <img src={heroImage} alt="" className='w-[20%] h-[25%] relative z-[5] mb-5'/> */}

        <div className='absolute z-[0] w-[40%] h-[35%] top-0 pink__gradient'></div>
        <div className='absolute z-[0] w-[80%] h-[85%] rounded-full bottom-40 white__gradient'></div>
        <div className='absolute z-[0] w-[50%] h-[50%] right-20 bottom-20 blue__gradient'></div>

        <div className={`flex flex-row items-center py-[6px] px-40 bg-discount-gradient rounded-[10px] mb-2`}>
          <p className={`${styles.paragraph}`}>
            <span className={`text-white`}>
              Your Web3 Username
            </span>
          </p>
        </div>

        <div className='flex items-center gap-5 w-[50%] m-4'>
          <input 
            type="text" 
            placeholder="Search for a Domain Name" 
            className="
              p-3
              placeholder-slate-400
              text-slate-300 relative
              bg-discount-gradient rounded text-sm border
              border-slate-500 outline-none
              focus:outline-none focus:ring 
              w-full"
          />
          <div className="">
            <VscSearch color='white' size={25}/>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;