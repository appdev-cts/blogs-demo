import React from 'react';
import { RotatingSquare } from 'react-loader-spinner';

const CenteredLoader = () => {
    return (
        <div style={loaderContainerStyle}>
            <RotatingSquare
                visible={true}
                height="100"
                width="100"
                color="#4fa94d"
                ariaLabel="rotating-square-loading"
                wrapperStyle={{}}
                wrapperClass=""
            />
        </div>
    );
};

const loaderContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#282c34', // Optional: Change to match your app's background color
};

export default CenteredLoader;
