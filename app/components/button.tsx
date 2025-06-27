import React from "react";

interface ButtonProps {
    text: string;
    onClick: () => void;
    className?: string
}

const Button: React.FC<ButtonProps> = ({ text ,onClick ,className}) => {
    return (
        <button 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded align-middle" type="submit"
        onClick={onClick}
        > 
            {text}
        </button>
    );
}

export default Button;