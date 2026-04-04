import { AppSidebar } from "@/components/app-sidebar"
import { CreateRoomDialog } from "@/components/createRoomDialog";
import { Rooms } from "@/components/rooms";
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import { getCurrentUser } from "@/lib/auth"

export default async function RoomsPage() {
    const user = await getCurrentUser();

    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-lg text-muted-foreground">
                    Please sign in to view the dashboard.
                </p>
            </div>
        );
    }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={{ name: user.name, email: user.email }}/>
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex items-center justify-between pt-4 px-4 md:gap-6">
          <h1 className="text-3xl font-semibold">Rooms</h1>
          <div><CreateRoomDialog /></div>
          </div>
            <div className="flex flex-wrap gap-4 p-4 md:gap-6">
             <Rooms />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
