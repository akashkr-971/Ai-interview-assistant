import React from "react";

interface ButtonProps {
    text: string;
}

const Button: React.FC<ButtonProps> = ({ text }) => {
    return (
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded align-middle" type="submit"> 
            {text}
        </button>
    );
}

export default Button;