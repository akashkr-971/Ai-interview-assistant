import React from "react";

interface InputFieldProps {
  label: string;
  placeholder?: string;
  type?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, placeholder,type,name,value,onChange }) => {
    return (
    <div className="flex flex-col">
      <label className="text-md ml-1 font-medium text-gray-700 mb-1">{label}</label>
      <input
        placeholder={placeholder}
        type={type}
        name={name}
        value={value}
        required
        onChange={onChange}
        autoComplete="current-password"
        className="mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
} 


export default InputField;