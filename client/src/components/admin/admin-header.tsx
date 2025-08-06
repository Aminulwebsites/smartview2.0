import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import logoImage from '@/assets/logo.png';

export default function AdminHeader() {
  const { user, isAuthenticated } = useAuth();
  const { logoutAdmin } = useAdminAuth();

  return (
    <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <div className="h-20 w-auto cursor-pointer">
                <img 
                  src={logoImage}
                  alt=""
                  className="h-20 w-auto object-contain filter brightness-0 invert"
                />
              </div>
            </Link>
            <div className="text-sm text-gray-300">
              Admin Panel
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <>
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4" />
                  <span>{user?.firstName} {user?.lastName}</span>
                  <span className="text-gray-400">({user?.role})</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    logoutAdmin();
                    localStorage.removeItem('sessionId');
                    window.location.href = '/';
                  }}
                  className="text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Exit Admin
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}