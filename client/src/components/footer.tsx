import { useState, useEffect } from 'react';
import { Instagram } from 'lucide-react';

export default function Footer() {
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formattedDateTime = now.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      setCurrentDateTime(formattedDateTime);
    };

    // Update immediately
    updateDateTime();

    // Update every second
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);
  return (
    <footer className="bg-dark-gray text-white py-8 sm:py-12 mt-8 sm:mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Developer</h4>
            <div className="flex items-center space-x-2">
              <a 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  // Create invisible iframe to test app availability
                  const iframe = document.createElement('iframe');
                  iframe.style.display = 'none';
                  iframe.src = 'instagram://user?username=vfxgameofficial';
                  document.body.appendChild(iframe);
                  
                  // Remove iframe and fallback to web if app not available
                  setTimeout(() => {
                    document.body.removeChild(iframe);
                    window.location.href = 'https://www.instagram.com/vfxgameofficial/';
                  }, 1000);
                }}
                className="hover:text-primary transition-colors flex items-center gap-2"
              >
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-gray-300 hover:text-white text-sm sm:text-base">Developer</span>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Company</h4>
            <div className="flex items-center space-x-2">
              <a 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  // Create invisible iframe to test app availability
                  const iframe = document.createElement('iframe');
                  iframe.style.display = 'none';
                  iframe.src = 'instagram://user?username=smart_view_restaurat';
                  document.body.appendChild(iframe);
                  
                  // Remove iframe and fallback to web if app not available
                  setTimeout(() => {
                    document.body.removeChild(iframe);
                    window.location.href = 'https://www.instagram.com/smart_view_restaurat/tagged/';
                  }, 1000);
                }}
                className="hover:text-primary transition-colors flex items-center gap-2"
              >
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-gray-300 hover:text-white text-sm sm:text-base">Company</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-600 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-300">
          <p className="text-xs sm:text-sm">&copy; {currentDateTime} SmartView2.0. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
