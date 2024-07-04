import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import { useAuth } from '../context/AuthContext';
import { formats } from '../utils/constants';
import 'react-quill/dist/quill.snow.css';
import { TiTick } from "react-icons/ti";
import { ImCancelCircle } from "react-icons/im";
import { v4 as uuidv4 } from 'uuid';
import TagsInput from './TagsInput'; // Import the TagsInput component
import { ImCross } from "react-icons/im";

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
    const [validationErrors, setValidationErrors] = useState([]);
    const [isSaved, setIsSaved] = useState(false);
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
        setLoading(true);
        const headers = {
            Authorization: `Bearer ${token}`
        };
        try {
            const sanitizedContent = sanitizeContent(quillContent);
            const updatedFormData = { ...formData, content: sanitizedContent, imageUrls: images };
            const response = await axios.post(`${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/upload-blog`, updatedFormData, { headers });
            if (response.data?.status) {
                setLoading(true);
            }
            setTimeout(() => {
                setLoading(false);
                setIsSaved(true);
            }, 1000);
            setTimeout(() => {
                onClose();
                onChildUpdate();
            }, 2000);
        } catch (error) {
            if (error?.response && error?.response?.data && error?.response?.data?.response?.details) {
                const errors = error.response.data.response.details.map(detail => detail.message);
                setValidationErrors(errors);
            } else {
                setValidationErrors([error?.response?.data?.message]);
            }
            setLoading(false);
            setTimeout(() => setValidationErrors([]), 2000);
        }
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
                    console.log(uniqueId);
                    const imageUrl = `${reader.result}#${uniqueId}`;
                    console.log(imageUrl);
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
            console.log(imageUrlsSet);
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
            <div className="bg-white p-8 rounded-lg shadow-md w-2/3 max-h-[100vh] overflow-y-auto">
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
                {loading && (
                    <div className="absolute top-5 right-0 m-4 bg-green-500 text-white p-4 rounded shadow">
                        <div className="flex items-center">
                            <div role="status">
                                <svg aria-hidden="true" class="w-4 h-4 me-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" /><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" /></svg>
                                <span className="sr-only">Loading...</span>
                            </div>
                            <p>Uploading your blog</p>
                        </div>
                    </div>
                )}
                {isSaved && (
                    <div className="absolute top-5 right-0 m-4 bg-green-500 text-white p-4 rounded shadow">
                        <div className='flex items-center gap-1'>
                            <TiTick />Uploaded successfully!
                        </div>
                    </div>
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
            </div>
        </div>
    );
};

export default UploadBlog;
