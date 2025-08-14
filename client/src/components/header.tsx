import { useState } from 'react';
import { Link } from 'wouter';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/auth-modal';
import logoImage from '@/assets/logo.png';

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function Header({ searchQuery = '', onSearchChange }: HeaderProps) {
  const { itemCount, toggleCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main header */}
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center">
            <Link href="/">
              <div className="h-20 w-auto cursor-pointer">
                <img 
                  src={logoImage}
                  alt="SmartView2.0"
                  className="h-20 w-auto object-contain"
                />
              </div>
            </Link>
          </div>
          
          {/* Desktop search */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="w-full relative">
              <Input
                type="text"
                placeholder="Search for foods"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full pr-10"
              />
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Mobile search toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Button>

            {/* Desktop buttons */}
            <div className="hidden sm:flex items-center space-x-2">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleCart}
                    className="relative"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Button>
                  <Link href="/profile">
                    <Button variant="ghost" size="sm">
                      <User className="h-5 w-5" />
                      <span className="ml-2">Profile</span>
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <AuthModal>
                    <Button variant="default" size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                      Login
                    </Button>
                  </AuthModal>
                  <AuthModal defaultTab="register">
                    <Button variant="default" size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                      Register
                    </Button>
                  </AuthModal>
                </>
              )}
            </div>

            {/* Mobile buttons */}
            <div className="flex sm:hidden items-center space-x-1">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleCart}
                    className="relative"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-xs">
                        {itemCount}
                      </span>
                    )}
                  </Button>
                  <Link href="/profile">
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <AuthModal>
                    <Button variant="default" size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs px-2">
                      Login
                    </Button>
                  </AuthModal>
                  <AuthModal defaultTab="register">
                    <Button variant="default" size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs px-2">
                      Register
                    </Button>
                  </AuthModal>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile search bar */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for foods"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full pr-10"
              />
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
