import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit } from 'react-icons/fa';
import EditBlog from './EditBlog'; 
import { useAuth } from '../context/AuthContext'
import DOMPurify from 'dompurify';

const DashboardCard = (props) => {
    const {onChildUpdate}= props;
    const [isEditing, setIsEditing] = useState(false);
    const { _id, tittle, content, tags } = props?.blog;
    const [isExpanded, setIsExpanded] = useState(false);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleEditFormClose = () => {
        setIsEditing(false);
    };


    return (
        <div className="max-w-md border rounded-lg overflow-hidden shadow-lg mx-4 my-8 flex flex-col">
            <Link to={`/blog/${_id}`}>
                <div className="px-6 py-4">
                    <div className="font-bold text-xl mb-2">{tittle}</div>
                    <div className="text-gray-700 text-base"
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(isExpanded ? content : `${content.slice(0, 500)}...`),
                        }}
                    >

                    </div>
                </div>
            </Link>
            <div className="px-6 py-2 ">
                {tags.map((tag, index) => (
                    <span key={index} className="inline-block bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-300 mr-2">{tag}</span>
                ))}

            </div>

            <div className="px-6 py-2 flex justify-end items-center">
                <button onClick={handleEditClick} className="text-blue-500 hover:text-blue-300 font-semibold focus:outline-none">
                    <FaEdit />
                    <span className="ml-1">Edit</span>
                </button>
            </div>

            {isEditing && <EditBlog onChildUpdate ={onChildUpdate} blog={props.blog} onClose={handleEditFormClose} />}
        </div>
    );
};

export default DashboardCard;
