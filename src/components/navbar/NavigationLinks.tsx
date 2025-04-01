
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";

const NavigationLinks = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList className="flex justify-center">
        <NavigationMenuItem>
          <Link to="/" className="text-white hover:text-blue-300 px-4 py-2 transition-colors">
            Home
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/courses" className="text-white hover:text-blue-300 px-4 py-2 transition-colors">
            Courses
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default NavigationLinks;
