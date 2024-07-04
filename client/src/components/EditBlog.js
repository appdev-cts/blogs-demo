import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { ImCross } from "react-icons/im";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import { useLocation } from 'react-router-dom';
import { MdDelete } from "react-icons/md";
import { TiTick } from "react-icons/ti";
import { ImCancelCircle } from "react-icons/im";
import { v4 as uuidv4 } from 'uuid';
import TagsInput from './TagsInput'; // Import the TagsInput component
import { useNavigate } from 'react-router-dom';
const EditBlog = ({ blog, onClose, onChildUpdate }) => {
    console.log(blog);
    const location = useLocation()
    console.log(location.pathname.includes('/blog'));
    const navigate  = useNavigate();
    const quill = useRef(null);
    const [formData, setFormData] = useState({
        tittle: blog.tittle,
        content: blog.content || '',
        tags: blog.tags || [],
        imageUrls: blog.imageUrls || []
    });
    console.log(formData.imageUrls);
    const [images, setImages] = useState([]);
    const [validationErrors, setValidationErrors] = useState([]); // State for validation errors
    const [isDeleteClicked, setIsDeleteClicked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [delLoading, setDelLoading] = useState(false);

    const insertImage = useCallback((imageUrl) => {
        const quillEditor = quill.current.getEditor();
        const range = quillEditor.getSelection(true);
        quillEditor.insertEmbed(range.index, 'image', imageUrl, 'user');
    }, []);

    const imageHandler = useCallback(() => {
        console.log("image handler called");
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = () => {
            const file = input.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    const uniqueId = uuidv4();  // Generate a unique ID
                    const imageUrl = `${reader.result}#${uniqueId}`;
                    setFormData(prevData => ({
                        ...prevData,
                        imageUrls: [...prevData.imageUrls, imageUrl]
                    }));
                    insertImage(imageUrl);

                    // Add the new image URL to the formData.imageUrls state

                };
                reader.readAsDataURL(file);
            }
        };
    }, [insertImage]);


    const handleRemoveImage = useCallback((imageUrl) => {
        const quillEditor = quill.current.getEditor();
        const delta = quillEditor.getContents();
        const ops = delta.ops;

        // Filter out the operations that insert the image being removed
        const newOps = ops.filter(op => !(op.insert && op.insert.image === imageUrl));

        // Replace the contents of the Quill editor with the updated operations
        quillEditor.setContents(newOps, 'user');

        // Remove the image URL from the formData.imageUrls state
        setFormData(prevData => ({
            ...prevData,
            imageUrls: prevData.imageUrls.filter(imgUrl => imgUrl !== imageUrl)
        }));
    }, []);



    useEffect(() => {
        const quillEditor = quill.current.getEditor();
        quillEditor.on('text-change', (delta, oldDelta, source) => {
            if (source === 'user') {
                const currentContents = quillEditor.getContents();
                const newImages = [];

                // Loop through the current contents to find images
                currentContents.ops.forEach(op => {
                    if (op.insert && op.insert.image) {
                        newImages.push(op.insert.image);
                    }
                });

                // Update the images state with the new list of images
                setImages(newImages);
                setFormData(prevData => ({
                    ...prevData,
                    imageUrls: newImages
                }));
            }
        });
    }, []);


    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ header: [2, 3, 4, false] }],
                ['bold', 'italic', 'underline', 'blockquote'],
                [{ color: [] }],
                [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
                ['link', 'image'],
                ['clean'],
            ],
            handlers: {
                image: imageHandler,
            },
        },
        clipboard: {
            matchVisual: true,
        },
    }), [imageHandler]);

    const formats = [
        'header',
        'bold',
        'italic',
        'underline',
        'strike',
        'blockquote',
        'list',
        'bullet',
        'indent',
        'link',
        'image',
        'color',
        'clean',
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };


    const handleContentChange = (value) => {
        setFormData({ ...formData, content: value });
    };

    const sanitizeContent = (content) => {
        // Define a regular expression pattern to match empty paragraphs
        const emptyParagraphPattern = /^<p[^>]*>(\s|&nbsp;|<br>)*<\/p>$/;
        // Check if the content matches the empty paragraph pattern
        if (emptyParagraphPattern.test(content.trim())) {
            return '';
        }
        // Otherwise, return the original content
        return content;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const sanitizedContent = sanitizeContent(formData.content);
            const updatedFormData = { ...formData, content: sanitizedContent };
            // Perform API request to update the blog data
            const response = await axios.put( `${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/update-blog/${blog._id}`, updatedFormData);
            console.log(response.data);
            if (response?.data?.status) {
                setLoading(true);
            }
            setTimeout(() => {
                setLoading(false);
                setIsSaved(true);
            }, 1000);
            const timer = setTimeout(() => {
                onClose();
                onChildUpdate();
            }, 2000);
            return ()=> clearTimeout(timer)
        } catch (error) {
            if (error?.response && error?.response?.data && error?.response?.data?.response?.details) {
                const errors = error?.response?.data?.response?.details.map(detail => detail.message);
                setValidationErrors(errors);
                const timer = setTimeout(() => {
                    setValidationErrors([]);
                }, 2000);
                return () => clearTimeout(timer);
            } else {
                setValidationErrors([error?.response?.data?.message]);
                const timer = setTimeout(() => {
                    setValidationErrors([]);
                }, 2000);
                return ()=> clearTimeout(timer)
            }
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.delete( `${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/delete-blog/${blog._id}`);
            console.log(response);
            if (response?.data?.status) {
                setLoading(true);
                setDelLoading(true);
            }
            setIsDeleteClicked(false);
            setFormData({
                tittle: '',
                content: '',
                tags: [],
                imageUrls: []
            });
            setTimeout(() => {
                setDelLoading(false);
                setLoading(false);
                setIsDeleted(true);
                if(location.pathname.includes('/blog')){
                    navigate(-1)
                }
            }, 2000);
            const timer = setTimeout(() => {
                onChildUpdate();
            }, 2000);
            return () => clearTimeout(timer);
        } catch (error) {
            console.log('Error in Deleting blog:', error?.response?.data?.message);
            if (error?.response && error?.response?.data && error?.response?.data?.response?.details) {
                const errors = error.response.data.response.details.map(detail => detail.message);
                setValidationErrors(errors);
                const timer = setTimeout(() => {
                    setValidationErrors([]);
                }, 2000);
                return () => clearTimeout(timer);
            } else {
                setValidationErrors([error?.response?.data?.message]);
                const timer = setTimeout(() => {
                    setValidationErrors([]);
                }, 2000);
                return ()=> clearTimeout
            }
        }
    };

    useEffect(() => {
        if (quill.current) {
            const toolbar = quill.current.getEditor().getModule('toolbar').container;
            toolbar.classList.add('sticky', 'top-0', 'z-10', 'bg-white');
        }
    }, [formData, images]);

    const handleClose = () => {
        onClose(); // Close the modal
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-1/2 max-h-[90vh] overflow-y-auto">
                <div className='flex justify-between items-center'>
                    <h2 className="text-2xl font-bold">Edit Blog</h2>
                    <ImCancelCircle onClick={handleClose} className='text-2xl font-bold text-red-600 cursor-pointer' />
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4 mt-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tittle">
                            Title
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="tittle"
                            type="text"
                            name="tittle"
                            value={formData.tittle}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">Content</label>
                        <div className="static top-20 z-10 bg-white">
                            <ReactQuill
                                ref={quill}
                                value={formData.content}
                                onChange={handleContentChange}
                                theme="snow"
                                modules={modules}
                                formats={formats}
                                placeholder='Enter your content here...'
                            />
                        </div>
                        <div className="flex flex-wrap mb-4">
                            {formData.imageUrls.map((url, index) => (
                                <div key={index} className="relative w-20 h-20 mr-2 mb-2 border border-gray-300 rounded-md overflow-hidden">
                                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        className="absolute top-0 right-0 mt-1 mr-1 bg-gray-200 hover:bg-gray-400 text-gray-800 font-bold py-1 px-1 rounded-full focus:outline-none focus:shadow-outline"
                                        type="button"
                                        onClick={() => handleRemoveImage(url)}
                                    >
                                        <ImCross className="text-red-500" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tags">
                            Tags(comma seperated or press enter)
                        </label>
                        {/* Use TagsInput component */}
                        <TagsInput
                            tags={formData.tags}
                            setTags={(newTags) => setFormData(prevData => ({
                                ...prevData,
                                tags: newTags
                            }))}
                        />                    </div>
                    <div className="flex justify-end items-center gap-2">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                            disabled={loading}
                        >
                            Save
                        </button>
                        <button
                            type='button'
                            className="ml-2 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            onClick={() => setIsDeleteClicked(true)}
                            disabled={loading}
                        >
                            <div className='flex gap-2 items-center'>
                                Delete
                                <MdDelete />
                            </div>
                        </button>
                    </div>
                </form>
                {isSaved && (
                    <div className="absolute top-5 right-0 m-4 bg-green-500 text-white p-4 rounded shadow">Saved successfully!</div>
                )}
                {validationErrors.length > 0 && (
                    <div className="absolute top-5 right-0 m-4 bg-red-500 text-white p-4 rounded shadow">
                        <ul>
                            {validationErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {isDeleteClicked && (
                    <div className="absolute top-0 left-0 z-50 right-0 bottom-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                        <div className="bg-white p-8 rounded-md shadow-md">
                            <h2 className="text-lg font-semibold mb-4">Are you sure you want to delete this blog?</h2>
                            <div className='flex justify-end items-center gap-2 p-2'>
                                <button onClick={() => setIsDeleteClicked(false)} className='text-gray-500 p-2 border bg-gray-300'>No, Cancel</button>
                                <button onClick={handleDelete} className='text-white bg-red-600 p-2 border'>Yes, I am sure</button>
                            </div>
                        </div>
                    </div>
                )}
                {isDeleted && (
                    <div className="absolute top-5 right-0 m-4 bg-green-500 text-white p-4 rounded shadow">
                        <div className='flex items-center gap-1'>
                            <TiTick />Deleted successfully!
                        </div>
                    </div>
                )}
                {loading && (
                    <div className="absolute top-5 right-0 m-4 bg-green-500 text-white p-4 rounded shadow">
                        <div className="flex items-center gap-1">
                            <p>
                                {delLoading ? 'Deleting your blog' : 'Updating blog'}
                            </p>
                            <div role="status">
                                <svg aria-hidden="true" class="w-4 h-4 me-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" /><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" /></svg>
                                <span className="sr-only">Loading...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditBlog;
