import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Separator } from "./ui/separator";
import MobileNavLinks from "./MobileNavLinks";

const MobileNav = ({ scrolled }: { scrolled?: boolean }) => {
  return (
    <Sheet>
      <SheetTrigger aria-label="Open menu">
        <Menu className={`h-6 w-6 ${scrolled ? "text-gray-800" : "text-white"}`} />
      </SheetTrigger>
      <SheetContent className="flex flex-col bg-white" side="right">
        <SheetTitle className="text-left text-gray-900">Menu</SheetTitle>
        <Separator />
        <SheetDescription className="flex-1 pt-4 flex flex-col text-left">
          <MobileNavLinks />
        </SheetDescription>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
