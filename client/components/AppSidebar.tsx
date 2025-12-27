"use client"

import { usePathname } from 'next/navigation'
import React, { useMemo } from 'react'
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from './ui/sidebar';
import { Building, FileText, Heart, Home, Menu, Settings, X } from 'lucide-react';
import { NAVBAR_HEIGHT } from '@/lib/constants';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function AppSidebar({ userType }: AppSidebarProps) {

    const pathname = usePathname();
    const { toggleSidebar, open } = useSidebar()

    const navLinks = useMemo(() => {
        return userType === "manager" ? [
            { icon: Building, label: "Properties", href: "/manager/properties" },
            { icon: FileText, label: "Applications", href: "/manager/applications" },
            { icon: Settings, label: "Settings", href: "/manager/settings" },
        ] : [
            { icon: Heart, label: "Favorites", href: "/tenants/favorites" },
            { icon: FileText, label: "Applications", href: "/tenants/application" },
            { icon: Home, label: "Residences", href: "/tenants/residences" },
            { icon: Settings, label: "Settings", href: "/tenants/settings" }
        ]
    }, [userType])

    return (
        <Sidebar
            collapsible='icon'
            className='bg-white shadow-lg'
            style={
                {
                    top: `${NAVBAR_HEIGHT}px`,
                    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`
                }
            }
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className={cn(
                            "flex min-h-[56px] w-full items-center pt-3 mb-3 ",
                            open ? "justify-between px-6" : "justify-center"
                        )}>
                            {
                                open ? (
                                    <>
                                        <h1 className='text-xl font-bold text-gray-800'>
                                            {
                                                userType === "manager" ? "Manager View" : "Renter View"
                                            }
                                        </h1>
                                        <button
                                            className='hover:bg-gray-100 p-2 rounded-md'
                                            onClick={toggleSidebar}
                                        >
                                            <X className='h-6 w-6 text-gray-600' />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className='hover:bg-gray-100 p-2 rounded-md'
                                            onClick={toggleSidebar}
                                        >
                                            <Menu className='h-6 w-6 text-gray-600' />
                                        </button>
                                    </>
                                )
                            }
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {navLinks.map((link) => {

                        const isActive = pathname === link.href;

                        return (
                            <SidebarMenuItem key={link.href}>
                                <SidebarMenuButton tooltip={!open ? link.label : undefined} asChild className={
                                    cn("flex items-center px-7 py-7",
                                        isActive ? "bg-gray-100 text-blue-600"
                                            : "text-gray-600 hover:bg-gray-100",
                                    )
                                }>
                                    <Link href={link.href} className={`flex items-center gap-3 `}>
                                        <link.icon className="h-5 w-5" />
                                        {open && <span>{link.label}</span>}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    )
}

export default AppSidebar
