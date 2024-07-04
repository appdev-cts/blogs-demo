import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LuLayoutPanelLeft } from "react-icons/lu";
import { FaUser } from "react-icons/fa";
import { useAuth } from '../context/AuthContext';
import { RiLoginBoxFill } from "react-icons/ri";
import { SiGnuprivacyguard } from "react-icons/si";
import { IoMdHome } from "react-icons/io";

const Sidebar = () => {
    const { isAuthenticated } = useAuth()
    const location = useLocation();
    return (
        <>
            <div className="fixed left-0 w-56 h-full border-r-[1px] p-4">
                {isAuthenticated() ? (
                    <>
                        <Link to='/'>
                            <div className={` mt-5 ${location.pathname === '/' && 'border border-blue-500 bg-blue-100 rounded-md'}`}>
                                <button className='flex gap-2 items-center py-2 px-2 '> <IoMdHome /> Home</button>
                            </div>
                        </Link>
                        <Link to='/dashboard'>
                            <div className={` mt-5 ${location.pathname === '/dashboard' && ('border border-blue-500 bg-blue-100 rounded-md')}`}>
                                <button className={`flex gap-2 items-center py-2 px-2 `}> <LuLayoutPanelLeft /> Dashboard</button>
                            </div>
                        </Link>
                       
                    </>) :
                    (
                    <>
                     <Link to='/'>
                            <div className={` mt-5 ${location.pathname === '/' && 'border border-blue-500 bg-blue-100 rounded-md'}`}>
                                <button className='flex gap-2 items-center py-2 px-2 '> <IoMdHome /> Home</button>
                            </div>
                        </Link>
                        <Link to='/login'>
                            <div className={` mt-5 ${location.pathname === '/login' && ('border border-blue-500 bg-blue-100 rounded-md')}`}>
                                <button className={`flex gap-2 items-center py-2 px-2 `}> <RiLoginBoxFill /> Login</button>
                            </div>
                        </Link>
                        <Link to='/register'>
                            <div className={` mt-5 ${location.pathname === '/register' && ('border border-blue-500 bg-blue-100 rounded-md')}`}>
                                <button className={`flex gap-2 items-center py-2 px-2 `}> <SiGnuprivacyguard /> Register</button>
                            </div>
                        </Link>
                    </>

                    )}

                {/* <div>
                    <button className='flex gap-2 items-center py-2 px-2 mt-5'> <LuLayoutPanelLeft/> Dashboard</button>
                </div> */}
                {/* <div className="flex flex-col gap-2">
                    <input placeholder='Search blogs...' className='border border-solid w-full' style={{ height: '38px', borderRadius: '5px', paddingLeft: '10px' }} type="text" onChange={handleSearchChange} value={searchText} name='' />
                    <button className='p-2 border rounded-[5px] bg-gray-200 text-zinc-600' onClick={() => setIsFilterClicked(true)}>
                        <div className='flex gap-2 items-center'>
                            <MdSort />
                            Filter
                            {isCount && (
                                <div className=" text-white w-3 h-3 bg-orange-500 rounded-full"></div>
                            )}
                        </div>
                    </button>
                    {isCount && (
                        <>
                            <button
                                data-tip
                                data-tooltip-id="tooltip-default"
                                data-tooltip-variant="dark"
                                data-tooltip-place="right"
                                className='p-2 border rounded-[5px] bg-gray-200 text-zinc-600'
                                onClick={handleFilterClearClick}
                            >
                                <MdOutlineFilterListOff />
                            </button>
                            <ReactTooltip id="tooltip-default" place="top" effect="solid">
                                Clear Filters
                            </ReactTooltip>
                        </>
                    )}
                </div> */}
            </div>
        </>
    )
}

export default Sidebar