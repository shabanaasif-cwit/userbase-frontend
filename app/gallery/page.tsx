import PageShell from "../component/page-shell"
import { GalleryGrid } from "./gallery-grid"

// Curated Unsplash images for user management themes (teams, security, dashboards, workflow)
const galleryItems = [
  {
    title: "Team Collaboration",
    description: "Organize teams and assign roles with clarity.",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop&q=80",
  },
  {
    title: "Secure Access",
    description: "Role-based permissions keep data protected.",
    image:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop&q=80",
  },
  {
    title: "User Profiles",
    description: "Centralize employee and member profiles.",
    image:
      "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&h=400&fit=crop&q=80",
  },
  {
    title: "Audit Insights",
    description: "Track activity and keep an audit trail.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&q=80",
  },
  {
    title: "Fast Onboarding",
    description: "Invite users and get them started quickly.",
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop&q=80",
  },
  {
    title: "Workflow Control",
    description: "Manage approvals and access in one hub.",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop&q=80",
  },
  {
    title: "Role Assignment",
    description: "Assign and change roles with clear permissions.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop&q=80",
  },
  {
    title: "Access Control",
    description: "Control who can see and do what across the platform.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop&q=80",
  },
  {
    title: "Activity Logs",
    description: "Review who did what and when for compliance.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&q=80",
  },
  {
    title: "Invite & Manage",
    description: "Invite new users and manage their access in one place.",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=400&fit=crop&q=80",
  },
  {
    title: "Approval Workflows",
    description: "Route requests and approvals through a single hub.",
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&h=400&fit=crop&q=80",
  },
  {
    title: "Dashboard Overview",
    description: "See users, roles, and activity at a glance.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&q=80",
  },
]

export const revalidate = 86400 // ISR: revalidate daily

export const metadata = {
  title: "Gallery | Userbase",
  description:
    "Highlights and capabilities of the User Management System. Team collaboration, secure access, and audit insights.",
}

export default function GalleryPage() {
  return (
    <PageShell variant="light" maxWidth="wide">
      <GalleryGrid items={galleryItems} />
    </PageShell>
  )
}
