
import { 
  Users, 
  Settings, 
  Shield, 
  Calendar, 
  FileText, 
  CheckCircle,
  CreditCard,
  BarChart3,
  AlertTriangle,
  Home
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: Home,
  },
  {
    title: "User Management",
    url: "/admin/users",
    icon: Users,
    badge: "Active",
  },
  {
    title: "Game Management",
    url: "/admin/games",
    icon: Settings,
  },
  {
    title: "Result Declaration",
    url: "/admin/results",
    icon: CheckCircle,
  },
  {
    title: "Payment Verification",
    url: "/admin/payments",
    icon: CreditCard,
    badge: "Pending",
  },
  {
    title: "Payout Processing",
    url: "/admin/payouts",
    icon: BarChart3,
  },
  {
    title: "Flags & Monitoring",
    url: "/admin/logs",
    icon: AlertTriangle,
  },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">MSM Market</h2>
            <p className="text-sm text-gray-500">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase text-gray-500 font-semibold mb-3">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={`w-full justify-start ${
                      location.pathname === item.url 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Link to={item.url} className="flex items-center space-x-3 px-3 py-2">
                      <item.icon className="w-5 h-5" />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          MSM Market Admin v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
