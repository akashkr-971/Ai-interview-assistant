// ...existing code...

const Modal = ({ title, children, onClose }: any) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg p-6 rounded-lg z-50 relative shadow-lg">
        <button onClick={onClose} className="absolute top-2 right-3 text-xl text-gray-500 hover:text-gray-800">×</button>
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default Modal;
