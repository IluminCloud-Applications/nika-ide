import * as React from "react"
import { NavMain } from "./NavMain"
import { NavProjects } from "./NavProjects"
import { NavUser } from "./NavUser"
import { TeamSwitcher } from "./TeamSwitcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Dados de exemplo — substitua pelos dados reais do seu app
const data = {
  user: {
    name: "João Silva",
    email: "joao@exemplo.com",
    avatar: "",
  },
  teams: [
    { name: "Minha Empresa", logo: "ri-building-line", plan: "Pro" },
    { name: "Projeto Pessoal", logo: "ri-user-line", plan: "Free" },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: "ri-dashboard-line",
      isActive: true,
      items: [
        { title: "Visão Geral", url: "#" },
        { title: "Analytics", url: "#" },
      ],
    },
    {
      title: "Projetos",
      url: "#",
      icon: "ri-folder-line",
      items: [
        { title: "Todos os Projetos", url: "#" },
        { title: "Novo Projeto", url: "#" },
      ],
    },
    {
      title: "Configurações",
      url: "#",
      icon: "ri-settings-3-line",
      items: [
        { title: "Geral", url: "#" },
        { title: "Equipe", url: "#" },
        { title: "Plano", url: "#" },
      ],
    },
  ],
  projects: [
    { name: "Site Principal", url: "#", icon: "ri-global-line" },
    { name: "App Mobile", url: "#", icon: "ri-smartphone-line" },
    { name: "API Backend", url: "#", icon: "ri-server-line" },
  ],
}

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
