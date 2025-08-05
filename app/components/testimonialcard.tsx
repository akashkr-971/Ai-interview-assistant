import { useState, useEffect } from "react";
import { User, Quote, X } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import Image from "next/image";

interface TestimonialCardProps {
  item: {
    id: number;
    testimonial: string;
    rating: number;
    created_at: string;
    user_id: {
      name: string;
      role?: string;
      avatar?: string;
    } | null;
  };
  className?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ item, className }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

  // Create or find modal root element
  useEffect(() => {
    let root = document.getElementById('modal-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'modal-root';
      root.style.position = 'fixed';
      root.style.top = '0';
      root.style.left = '0';
      root.style.width = '100%';
      root.style.height = '100%';
      root.style.pointerEvents = 'none';
      root.style.zIndex = '999999';
      document.body.appendChild(root);
    }
    setModalRoot(root);

    return () => {
      // Cleanup: remove modal root if no modals are open
      const existingRoot = document.getElementById('modal-root');
      if (existingRoot && !existingRoot.hasChildNodes()) {
        existingRoot.remove();
      }
    };
  }, []);

  // Format the date
  let formattedDate = "Date N/A";
  try {
    if (item.created_at) {
      formattedDate = format(new Date(item.created_at), "MMMM d, yyyy");
    }
  } catch (error) {
    console.error("Error formatting date:", error);
  }

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const modalContent = showModal && modalRoot ? createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999999,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(6px)',
          pointerEvents: 'all'
        }}
        onClick={() => setShowModal(false)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Modal Content */}
        <motion.div
          className="relative bg-white rounded-3xl shadow-2xl w-full mx-auto"
          style={{
            maxWidth: '650px',
            margin: '0 auto',
            maxHeight: '90vh'
          }}
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 30 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          {/* Decorative background elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 blur-2xl opacity-60" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-gradient-to-tr from-blue-200 to-purple-200 blur-2xl opacity-60" />
          
          <div className="relative p-6 md:p-8">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 group z-10"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="relative flex-shrink-0">
                <div className="p-1 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full shadow-lg">
                  {item.user_id?.avatar ? (
                    <Image
                      src={item.user_id.avatar}
                      alt={item.user_id.name || "User"}
                      className="w-12 h-12 rounded-full border-2 border-white object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-white">
                      <User className="w-6 h-6 text-purple-500" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 pt-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 mb-1 break-words">
                  {item.user_id?.name || "Anonymous"}
                </h3>
                {item.user_id?.role && (
                  <p className="text-sm text-purple-600 font-semibold mb-1">
                    {item.user_id.role}
                  </p>
                )}
                <p className="text-xs text-gray-500">{formattedDate}</p>
              </div>
            </div>

            {/* Testimonial Content */}
            <div className="mb-6">
              <Quote className="w-6 h-6 text-purple-300 mb-3" />
              <div className="relative pl-3 border-l-3 border-purple-400">
                <p className="text-gray-800 text-base leading-relaxed font-medium italic">
                  {item.testimonial}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      className={`w-5 h-5 ${index < item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                    </svg>
                  ))}
                </div>
                <span className="text-base font-semibold text-gray-700">
                  {item.rating.toFixed(1)} / 5
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Verified Review
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    modalRoot
  ) : null;

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className={`bg-gradient-to-br from-white to-gray-50 p-8 rounded-3xl shadow-md border border-gray-200/70 transition-all duration-300 ease-in-out flex flex-col h-full relative overflow-hidden cursor-pointer ${className || ''}`}
        onClick={() => setShowModal(true)}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-purple-100/30 blur-xl" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-blue-100/30 blur-xl" />

        <Quote className="absolute top-6 right-6 w-8 h-8 text-gray-200" size={24} />

        <div className="flex items-start gap-5 mb-6 relative z-10">
          <div className="relative p-1 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full shadow-lg">
            {item.user_id?.avatar ? (
              <Image
                src={item.user_id.avatar}
                alt={item.user_id.name || "User"}
                className="w-12 h-12 rounded-full border-2 border-white object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-white">
                <User className="w-5 h-5 text-purple-500" />
              </div>
            )}
          </div>
          <div className="flex-grow">
            <p className="text-lg font-bold text-gray-800">
              {item.user_id?.name || "Anonymous"}
            </p>
            {item.user_id?.role && (
              <p className="text-sm text-purple-600 font-medium mt-0.5">
                {item.user_id.role}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">{formattedDate}</p>
          </div>
        </div>

        {/* Truncated Text */}
        <p className="text-gray-700 mb-6 flex-grow relative z-10 text-lg italic truncate">
          &quot;{item.testimonial}&quot;
        </p>

        <div className="relative pt-5 border-t border-gray-200/50">
          <div className="absolute top-0 left-0 w-16 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <svg
                  key={index}
                  className={`w-6 h-6 ${index < item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                </svg>
              ))}
              <span className="ml-2 text-sm font-medium text-gray-500">
                {item.rating.toFixed(1)}
              </span>
            </div>
            <div className="text-xs text-gray-400">Verified Review</div>
          </div>
        </div>
      </motion.div>

      {/* Modal rendered via portal */}
      {modalContent}
    </>
  );
};

export default TestimonialCard;