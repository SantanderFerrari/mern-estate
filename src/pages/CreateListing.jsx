import React from 'react'
import { useState } from 'react';
import { getDownloadURL, getStorage, uploadBytesResumable, ref } from 'firebase/storage';
import { app } from '../firebase';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function CreateListing() {
    const { currentUser } = useSelector(state => state.user);
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [formData, setFormData] = useState({
        imageUrls: [],
        name: '',
        description: '',
        address: '',
        type: 'rent',
        bedrooms: 1,
        bathrooms: 1,
        regularPrice: 5000000,
        discountPrice: 5000,
        offer: false,
        parking: false,
        furnished: false,
    });
    const [uploading, setUploading] = useState(false);
    const [imageUploadError, setImageUploadError] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setloading] = useState(false);
    console.log(formData);

    const handleImageSubmit = (e) => {
        if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
            setUploading(true);
            setImageUploadError(false);
            const promises = [];

            for (let i = 0; i < files.length; i++) {
                promises.push(storeImage(files[i]));
            }
            Promise.all(promises)
                .then((urls) => {
                    setFormData({
                        ...formData,
                        imageUrls: formData.imageUrls.concat(urls),
                    });
                    setImageUploadError(false);
                    setUploading(false);
                })
                .catch((err) => {
                    setImageUploadError('Image upload failed (2 mb max per image)');
                    setUploading(false);
                });
        } else {
            setImageUploadError('You can only upload 6 images per listing');
            setUploading(false);
        }
    };

    const storeImage = async (file) => {
        return new Promise((resolve, reject) => {
            const storage = getStorage(app);
            const fileName = new Date().getTime() + file.name;
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, file);
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                },
                (error) => {
                    reject(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        resolve(downloadURL);
                    });
                }
            );
        });
    };

    const handleRemoveImage = (index) => {
        setFormData({
            ...formData,
            imageUrls: formData.imageUrls.filter((_, i) => i !== index),
        });
    };

    const handleChange = (e) => {
        if (e.target.id === 'sale' || e.target.id === 'rent') {
            setFormData({
                ...formData,
                type: e.target.id,
            });
        }

        if (
            e.target.id === 'parking' ||
            e.target.id === 'furnished' ||
            e.target.id === 'offer'
        ) {
            setFormData({
                ...formData,
                [e.target.id]: e.target.checked,
            });
        }

        if (
            e.target.type === 'number' ||
            e.target.type === 'text' ||
            e.target.type === 'textarea'
        ) {
            setFormData({
                ...formData,
                [e.target.id]: e.target.value,
            });
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.imageUrls.length < 1)
                return setError('You must upload atleast one image')
            if (+formData.regularPrice < +formData.discountPrice)
                return setError('Regular Price must be Higher Than discount ')
            setloading(true);
            setError(false);
            const res = await fetch('/api/listing/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    userRef: currentUser._id,
                }),
            });
            const data = await res.json();
            setloading(false);
            if (data.success === false) {
                setError(data.message);
            }
            navigate(`/listing/${data._id}`)
        } catch (error) {
            setError(error.message);
            setloading(false);
        }


    };
    return (
        <main className='p-3 max-w-4xl mx-auto'>
            <h1 className='text-3x1 font-semibold text-center my-7'>
                Create a Listing
            </h1>
            <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
                <div className='flex flex-col gap-4 flex-1' >
                    <input
                        type='text'
                        placeholder='Name'
                        className='border p-3 rounded-lg'
                        id='name'
                        maxLength='62'
                        minLength='10'
                        required
                        onChange={handleChange}
                        value={formData.name}
                    />
                    <textarea type='text'
                        placeholder='Description'
                        className='border p-3 rounded-lg'
                        id='description'
                        required
                        onChange={handleChange}
                        value={formData.description}
                    />
                    <input type='text'
                        placeholder='Address'
                        className='border p-3 rounded-lg'
                        id='address'
                        required
                        onChange={handleChange}
                        value={formData.address}
                    />
                    <div className='flex gap-7 flex-wrap'>
                        <div className='flex gap-2'>
                            <input type='checkbox'
                                id="sale"
                                className='w-5'
                                onChange={handleChange}
                                checked={formData.type === 'sale'}
                            />
                            <span>Sell</span>
                        </div>
                        <div className='flex gap-2'>
                            <input type='checkbox'
                                id="rent"
                                className='w-5'
                                onChange={handleChange}
                                checked={formData.type === 'rent'}
                            />
                            <span>Rent</span>
                        </div>
                        <div className='flex gap-2'>
                            <input type='checkbox'
                                id="parking"
                                className='w-5'
                                onChange={handleChange}
                                checked={formData.parking}
                            />
                            <span>Parking Spot</span>
                        </div>
                        <div className='flex gap-2'>
                            <input type='checkbox'
                                id="furnished"
                                className='w-5'
                                onChange={handleChange}
                                checked={formData.furnished}
                            />
                            <span>Furnished</span>
                        </div>
                        <div className='flex gap-2'>
                            <input type='checkbox'
                                id="offer"
                                className='w-5'
                                onChange={handleChange}
                                checked={formData.offer}
                            />
                            <span>Offer</span>
                        </div>
                    </div>
                    <div className='flex flex-wrap gap-5'>
                        <div className='flex items-center gap-2'>
                            <input
                                type='number'
                                id='bedrooms'
                                min='1'
                                max='10'
                                className='p-3 border border-gray-300 rounded-lg'
                                required
                                onChange={handleChange}
                                checked={formData.bedrooms}
                            />
                            <p>beds</p>
                        </div>
                        <div className='flex items-center gap-2'>
                            <input
                                type='number'
                                id='bathrooms'
                                min='1'
                                max='10'
                                className='p-3 border border-gray-300 rounded-lg'
                                required
                                onChange={handleChange}
                                checked={formData.bathrooms}
                            />
                            <p>Baths</p>
                        </div>
                        <div className='flex items-center gap-2'>
                            <input
                                type='number'
                                id='regularPrice'
                                min='5000000'
                                max='100000000000'
                                className='p-3 border border-gray-300 rounded-lg'
                                required
                                onChange={handleChange}
                                checked={formData.regularPrice}
                            />
                            <div className='flex flex-col items-center'>
                                <p>Regular Price</p>
                                <span className='text-xs'>(Kshs / month)</span>
                            </div>
                        </div>
                        {formData.offer && (

                            <div className='flex items-center gap-2'>
                                <input
                                    type='number'
                                    id='discountPrice'
                                    min='0'
                                    max='100000'
                                    className='p-3 border border-gray-300 rounded-lg'
                                    required
                                    onChange={handleChange}
                                    checked={formData.discountPrice}
                                />
                                <div className='flex flex-col items-center'>
                                    <p>Discounted Price</p>
                                    <span className='text-xs'>(Kshs / month)</span>
                                </div>
                            </div>

                        )}
                    </div>
                </div>
                <div className='flex flex-col flex-1 gap-4'>
                    <p className='font-semibold'>Images:
                        <span className='font-normal text-gray-600 ml-2'>
                            The first image will be the cover!
                        </span>
                    </p>
                    <div className='flex gap-4'>
                        <input
                            onChange={(e) => setFiles(e.target.files)}
                            className='p-3 border border-gray-300 rouned w-full'
                            type='file'
                            id='images'
                            accept='image/*'
                            multiple
                        />
                        <button
                            type='button'
                            disabled={uploading}
                            onClick={handleImageSubmit}
                            className='p-3 text-green-900 border border-green-800 rounded uppercase hover:shadow-lg disabled:opacity-70'>
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                    <p className='text-red-800 p-3 '>
                        {imageUploadError && imageUploadError}
                    </p>
                    {
                        formData.imageUrls.length > 0 &&
                        formData.imageUrls.map((url, index) => (
                            <div
                                key={url}
                                className='flex justify-between p-3 border items-center'>
                                <img src={url}
                                    alt='listing image'
                                    className='w-30 h-20 object-contain rounded-lg'
                                />
                                <button
                                    type='button'
                                    onClick={() => handleRemoveImage(index)}
                                    className='p-3 text-red-900 rounded-lg uppercase hover:opacity-70'
                                >
                                    Delete
                                </button>
                            </div>
                        ))
                    }
                    <button disabled={loading || uploading}
                        onClick={handleSubmit}
                        type='button'
                        className='p-3 bg-slate-700 text-white rounded-lg
                 uppercase hover:opacity-80 disabled:opacity-90'>
                        {loading ? 'Creating...' : 'Create listing'}
                    </button>
                    {error && <p className='text-red-800 text-sm'>{error}</p>}
                </div>

            </form>
        </main >
    );
}
