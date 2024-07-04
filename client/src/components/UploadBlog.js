import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import { useAuth } from '../context/AuthContext';
import 'react-quill/dist/quill.snow.css';
import { TiTick } from "react-icons/ti";
import { ImCancelCircle } from "react-icons/im";
import { v4 as uuidv4 } from 'uuid';
import TagsInput from './TagsInput'; // Import the TagsInput component
import { ImCross } from "react-icons/im";
import toast, { Toaster } from 'react-hot-toast';

const UploadBlog = ({ onClose, onChildUpdate }) => {
    const { token } = useAuth();
    const quill = useRef(null);
    const [images, setImages] = useState([]);
    const [formData, setFormData] = useState({
        tittle: '',
        content: '',
        tags: [],
        imageUrls: []
    });
    const [loading, setLoading] = useState(false);
    const [quillContent, setQuillContent] = useState('');
    const imageUrlsSet = useRef(new Set());

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const sanitizeContent = (content) => {
            const emptyParagraphPattern = /^<p[^>]*>(\s|&nbsp;|<br>)*<\/p>$/;
            if (emptyParagraphPattern.test(content.trim())) {
                return '';
            }
            return content;
        }

        // Show loading toast
        const promise = new Promise(async (resolve, reject) => {
            setLoading(true);
            const headers = {
                Authorization: `Bearer ${token}`
            };

            try {
                const sanitizedContent = sanitizeContent(quillContent);
                const updatedFormData = { ...formData, content: sanitizedContent, imageUrls: images };
                const response = await axios.post(`${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/upload-blog`, updatedFormData, { headers });

                if (response.data?.status) {
                    resolve('Blog uploaded successfully!');
                } else {
                    reject('An error occurred while uploading the blog.');
                }
            } catch (error) {
                setLoading(false);
                reject(error?.response?.data?.message || 'An error occurred while uploading the blog.');
            } finally {
                setLoading(false);
            }
        });
        toast.promise(
            promise,
            {
                loading: 'Uploading your blog...',
                success: 'Blog uploaded successfully!',
                error: (error) =>
                    error || 'An error occurred while uploading the blog.',
            },
            {
                style: {
                    minWidth: '250px',
                },
            }
        );

        // Handle side effects after toast.promise resolves or rejects
        promise.then(() => {
           const timer= setTimeout(() => {
                onClose();
                onChildUpdate();
            }, 2000);
            return ()=> clearTimeout(timer);
        }).catch((error) => {
            // Optionally handle any additional error cases here
            console.log(error);
        });
    };


    const insertImage = useCallback((imageUrl) => {
        const quillEditor = quill.current.getEditor();
        const range = quillEditor.getSelection(true);
        quillEditor.insertEmbed(range.index, 'image', imageUrl, 'user');
    }, []);

    const imageHandler = useCallback(() => {
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
                    setImages(prev => [...prev, imageUrl]);
                    insertImage(imageUrl);
                };
                reader.readAsDataURL(file);
            }
        };
    }, [insertImage]);

    const handleRemoveImage = useCallback((imageUrl) => {
        const quillEditor = quill.current.getEditor();
        const delta = quillEditor.getContents();
        const ops = delta.ops;

        let indexToDelete = -1;
        let currentIndex = 0;

        for (let i = 0; i < ops.length; i++) {
            if (ops[i].insert && ops[i].insert.image === imageUrl) {
                indexToDelete = currentIndex;
                break;
            }
            currentIndex += ops[i].insert ? ops[i].insert.length || 1 : 1;
        }

        if (indexToDelete !== -1) {
            quillEditor.deleteText(indexToDelete, 1, 'user');
            imageUrlsSet.current.delete(imageUrl);
            setImages(prevImages => prevImages.filter(img => img !== imageUrl));
        }
    }, []);

    useEffect(() => {
        const quillEditor = quill.current.getEditor();
        quillEditor.on('text-change', (delta, oldDelta, source) => {
            if (source === 'user') {
                const newImages = [];
                quillEditor.getContents().ops.forEach(op => {
                    if (op.insert && op.insert.image) {
                        newImages.push(op.insert.image);
                    }
                });
                setImages(newImages);
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

    useEffect(() => {
        if (quill.current) {
            const toolbar = quill.current.getEditor().getModule('toolbar').container;
            toolbar.classList.add('sticky', 'top-0', 'z-10', 'bg-white');
        }
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-2/3 max-h-[100vh] overflow-y-auto relative">
                <div className='flex items-center justify-between'>
                    <h2 className="text-lg font-bold">Add New Blog</h2>
                    <ImCancelCircle onClick={onClose} className='text-2xl font-bold text-red-600 cursor-pointer' />
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4 mt-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tittle">Title</label>
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
                                value={quillContent}
                                onChange={setQuillContent}
                                theme="snow"
                                modules={modules}
                                formats={formats}
                                placeholder='Enter your content here...'
                            />
                        </div>
                        <div className="flex flex-wrap mb-4">
                            {images.map((url, index) => (
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
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tags">Tags (comma-separated or press enter)</label>
                        <TagsInput tags={formData.tags} setTags={(tags) => setFormData({ ...formData, tags })} />
                    </div>
                    <div className="flex justify-end">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                            disabled={loading}
                        >Upload
                        </button>
                        <button
                            className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="button"
                            disabled={loading}
                            onClick={onClose}
                        >Cancel</button>
                    </div>
                </form>
                <Toaster
                    toastOptions={{
                        success: {
                            position: "top-right"
                        },
                        loading: {
                            position: 'top-right'
                        },
                        error: {
                            position: 'top-right'
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default UploadBlog;
