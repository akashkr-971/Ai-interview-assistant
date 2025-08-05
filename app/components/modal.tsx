// ...existing code...

const Modal = ({ title, children, onClose }: any) => {
  return (
    <div className="fixed inset-0 z-40 flex backdrop-blur items-center justify-center border border-gray-300">
      <div className="bg-white w-full max-w-lg p-6 rounded-lg z-50 relative shadow-lg border border-gray-300">
        <button onClick={onClose} className="absolute top-2 right-3 text-xl text-gray-500 hover:text-gray-800">×</button>
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default Modal;
