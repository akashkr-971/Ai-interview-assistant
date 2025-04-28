import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div 
      className="flex items-center justify-center bg-cover bg-center bg-no-repeat" 
      style={{ backgroundImage: "url('/bg-auth-1.jpg')" }}
    >
        <div className="w-full">
            {children}  
        </div>
    </div>
  );
};

export default AuthLayout;
