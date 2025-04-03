
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";

interface UserMenuProps {
  user: any;
}

/**
 * User menu component for logged-in users
 */
const UserMenu = ({ user }: UserMenuProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!user?.id) return;
        
        const { data, error } = await supabase
          .from('users')
          .select('profile_picture')
          .eq('auth_user_id', user.id)
          .single();
        
        if (data && data.profile_picture) {
          setProfilePicture(data.profile_picture);
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  /**
   * Handles user logout
   */
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      // Error handled silently
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer">
          {!loading && profilePicture ? (
            <AvatarImage 
              src={profilePicture} 
              alt="Profile picture" 
              className="object-cover"
              onError={(e) => {
                console.error("Error loading profile picture in UserMenu");
                (e.target as HTMLImageElement).src = '';
              }}
            />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-primary">
            {loading ? "..." : (user.email?.charAt(0).toUpperCase() || user.user_metadata?.username?.charAt(0).toUpperCase() || "U")}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/dashboard")}>
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
