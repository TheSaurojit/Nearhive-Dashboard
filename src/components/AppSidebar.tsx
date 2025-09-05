"use client";

import {
  Home,
  Inbox,
  Calendar,
  Search,
  Settings,
  User2,
  ChevronUp,
  Plus,
  Projector,
  ChevronDown,
  Truck,
  User,
  Flag,
  Pizza,
  Boxes,
  IndianRupee,
  Maximize,
  StoreIcon,
  Music,
  VideoIcon,
  BadgeIndianRupee,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "./ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Orders", url: "/orders", icon: Inbox },
  { title: "Cancel Orders", url: "/cancel-order", icon: Inbox },
  { title: "Store Earnings", url: "/storeearnings", icon: BadgeIndianRupee },
  { title: "Middleman", url: "/middleman", icon: Truck },
  { title: "Customers", url: "/customers", icon: User },
  { title: "Users", url: "/users", icon: User },
  { title: "Campaigns", url: "/campaigns", icon: Flag },
  { title: "Cuisine", url: "/cuisine", icon: Pizza },
  { title: "Hive Creators", url: "/hivecreators", icon: Projector },
  { title: "Food Playlist", url: "/foodplaylist", icon: Music },
    { title: "Videos", url: "/videos", icon: VideoIcon },
];

const AppSidebar = () => {
  const pathname = usePathname();

  const isActive = (url: string) => pathname === url;

  return (
    <Sidebar collapsible="icon" className="font-main">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/" className="flex items-center gap-2">
                <Image src="/Frame 625231.svg" alt="logo" width={30} height={30} />
                <span>NearHive</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className={isActive(item.url) ? "bg-white text-black rounded-md" : ""}
                >
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center gap-2">
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.title === "Orders" && (
                    <SidebarMenuBadge>24</SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Collapsible Sections */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Stores
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem className={isActive("/stores") ? "bg-white text-black rounded-md" : ""}>
                    <SidebarMenuButton asChild>
                      <Link href="/stores" className="flex items-center gap-2">
                        <Pizza />
                        Food
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem className={isActive("/storecategories") ? "bg-white text-black rounded-md" : ""}>
                    <SidebarMenuButton asChild>
                      <Link href="/storecategories" className="flex items-center gap-2">
                        <StoreIcon/>
                        Store Categories
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Products
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem className={isActive("/products") ? "bg-white text-black rounded-md" : ""}>
                    <SidebarMenuButton asChild>
                      <Link href="/products" className="flex items-center gap-2">
                        <Pizza />
                        All Products (Food)
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Payments
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {["/payments", "/middleman", "/refunds", "/trackrecord"].map((url, idx) => (
                    <SidebarMenuItem
                      key={url}
                      className={isActive(url) ? "bg-white text-black rounded-md" : ""}
                    >
                      <SidebarMenuButton asChild>
                        <Link href={url} className="flex items-center gap-2">
                          <IndianRupee />
                          {["Store", "Middleman", "Refunds", "Track Records"][idx]}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Others
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {["/blogs", "/#", "/#"].map((url, idx) => (
                    <SidebarMenuItem
                      key={idx}
                      className={isActive(url) ? "bg-white text-black rounded-md" : ""}
                    >
                      <SidebarMenuButton asChild>
                        <Link href={url} className="flex items-center gap-2">
                          <Maximize />
                          {["Blogs", "Banners", "Posters"][idx]}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="flex items-center gap-2">
                  <User2 /> Username<ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
