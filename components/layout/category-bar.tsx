import Link from "next/link";
import { categories } from "@/lib/data/categories";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export function CategoryBar() {
  return (
    <div className="border-b border-steel bg-savanna">
      <div className="mx-auto max-w-7xl overflow-x-auto px-4 md:px-8">
        <NavigationMenu className="max-w-none flex-none justify-start">
          <NavigationMenuList className="flex-none justify-start">
            {categories.map((category) => (
              <NavigationMenuItem key={category.id}>
                <NavigationMenuTrigger className="text-sm font-medium">
                  {category.name}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-64 gap-1 p-2">
                    {category.subcategories.map((sub) => (
                      <li key={sub.id}>
                        <NavigationMenuLink
                          render={
                            <Link
                              href={`/shop/${category.slug}?subcategory=${sub.slug}`}
                            />
                          }
                        >
                          {sub.name}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}
