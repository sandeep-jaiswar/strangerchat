import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
import { Button } from "components/Button/Button"
import { IconButton } from "components/IconButton/IconButton"
import { DropdownMenu, DropdownMenuItem } from "./DropdownMenu"

const meta: Meta<typeof DropdownMenu> = {
  title: "Components/DropdownMenu",
  component: DropdownMenu,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Lightweight dropdown menu following Apple's Human Interface Guidelines. Features keyboard navigation, submenus, icons, and keyboard shortcuts.",
      },
    },
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof DropdownMenu>

// Icons
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)

const basicItems: (DropdownMenuItem | "divider")[] = [
  {
    id: "edit",
    label: "Edit",
    icon: <EditIcon />,
    shortcut: "⌘E",
    onClick: () => alert("Edit clicked"),
  },
  {
    id: "duplicate",
    label: "Duplicate",
    icon: <CopyIcon />,
    shortcut: "⌘D",
    onClick: () => alert("Duplicate clicked"),
  },
  "divider",
  {
    id: "delete",
    label: "Delete",
    icon: <DeleteIcon />,
    danger: true,
    onClick: () => alert("Delete clicked"),
  },
]

/**
 * Default dropdown menu
 */
export const Default: Story = {
  render: () => <DropdownMenu trigger={<Button>Actions</Button>} items={basicItems} />,
}

/**
 * With icon button trigger
 */
export const IconTrigger: Story = {
  render: () => (
    <DropdownMenu
      trigger={
        <IconButton aria-label="More options">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </IconButton>
      }
      items={basicItems}
    />
  ),
}

/**
 * Different positions
 */
export const Positions: Story = {
  render: () => (
    <div className="flex gap-4">
      <DropdownMenu trigger={<Button size="sm">Bottom Start</Button>} items={basicItems} position="bottom-start" />
      <DropdownMenu trigger={<Button size="sm">Bottom End</Button>} items={basicItems} position="bottom-end" />
      <DropdownMenu trigger={<Button size="sm">Top Start</Button>} items={basicItems} position="top-start" />
    </div>
  ),
}

/**
 * With submenus
 */
export const WithSubmenus: Story = {
  render: () => {
    const items: (DropdownMenuItem | "divider")[] = [
      {
        id: "file",
        label: "File",
        submenu: [
          { id: "new", label: "New File", shortcut: "⌘N", onClick: () => alert("New File") },
          { id: "open", label: "Open...", shortcut: "⌘O", onClick: () => alert("Open") },
          { id: "save", label: "Save", shortcut: "⌘S", onClick: () => alert("Save") },
        ],
      },
      {
        id: "export",
        label: "Export",
        submenu: [
          { id: "pdf", label: "Export as PDF", onClick: () => alert("Export PDF") },
          { id: "png", label: "Export as PNG", onClick: () => alert("Export PNG") },
          { id: "svg", label: "Export as SVG", onClick: () => alert("Export SVG") },
        ],
      },
      "divider",
      {
        id: "close",
        label: "Close",
        shortcut: "⌘W",
        onClick: () => alert("Close"),
      },
    ]

    return <DropdownMenu trigger={<Button>File Menu</Button>} items={items} />
  },
}

/**
 * User profile menu
 */
export const ProfileMenu: Story = {
  render: () => {
    const items: (DropdownMenuItem | "divider")[] = [
      {
        id: "profile",
        label: "View Profile",
        onClick: () => alert("View Profile"),
      },
      {
        id: "settings",
        label: "Settings",
        shortcut: "⌘,",
        onClick: () => alert("Settings"),
      },
      "divider",
      {
        id: "help",
        label: "Help & Support",
        onClick: () => alert("Help"),
      },
      {
        id: "feedback",
        label: "Send Feedback",
        onClick: () => alert("Feedback"),
      },
      "divider",
      {
        id: "logout",
        label: "Log Out",
        danger: true,
        onClick: () => alert("Logout"),
      },
    ]

    return (
      <DropdownMenu
        trigger={
          <button className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
            <span className="font-medium">John Doe</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        }
        items={items}
      />
    )
  },
}

/**
 * Context menu example
 */
export const ContextMenu: Story = {
  render: () => {
    const items: (DropdownMenuItem | "divider")[] = [
      {
        id: "open",
        label: "Open",
        shortcut: "↵",
        onClick: () => alert("Open"),
      },
      {
        id: "open-new-tab",
        label: "Open in New Tab",
        shortcut: "⌘↵",
        onClick: () => alert("Open in New Tab"),
      },
      "divider",
      {
        id: "copy-link",
        label: "Copy Link",
        onClick: () => alert("Copy Link"),
      },
      {
        id: "share",
        label: "Share",
        submenu: [
          { id: "email", label: "Email", onClick: () => alert("Share via Email") },
          { id: "twitter", label: "Twitter", onClick: () => alert("Share on Twitter") },
          { id: "facebook", label: "Facebook", onClick: () => alert("Share on Facebook") },
        ],
      },
      "divider",
      {
        id: "download",
        label: "Download",
        onClick: () => alert("Download"),
      },
      {
        id: "report",
        label: "Report",
        danger: true,
        onClick: () => alert("Report"),
      },
    ]

    return (
      <div className="rounded-xl bg-gray-50 p-8">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="mb-4 text-gray-600">Right-click or use the button below</p>
          <DropdownMenu trigger={<Button variant="bordered">Show Context Menu</Button>} items={items} />
        </div>
      </div>
    )
  },
}

/**
 * Disabled items
 */
export const DisabledItems: Story = {
  render: () => {
    const items: DropdownMenuItem[] = [
      {
        id: "cut",
        label: "Cut",
        shortcut: "⌘X",
        disabled: true,
        onClick: () => alert("Cut"),
      },
      {
        id: "copy",
        label: "Copy",
        shortcut: "⌘C",
        onClick: () => alert("Copy"),
      },
      {
        id: "paste",
        label: "Paste",
        shortcut: "⌘V",
        disabled: true,
        onClick: () => alert("Paste"),
      },
    ]

    return <DropdownMenu trigger={<Button>Edit</Button>} items={items} />
  },
}

/**
 * Table row actions
 */
export const TableActions: Story = {
  render: () => {
    const items: (DropdownMenuItem | "divider")[] = [
      {
        id: "view",
        label: "View Details",
        onClick: () => alert("View Details"),
      },
      {
        id: "edit",
        label: "Edit",
        icon: <EditIcon />,
        onClick: () => alert("Edit"),
      },
      {
        id: "duplicate",
        label: "Duplicate",
        icon: <CopyIcon />,
        onClick: () => alert("Duplicate"),
      },
      "divider",
      {
        id: "archive",
        label: "Archive",
        onClick: () => alert("Archive"),
      },
      {
        id: "delete",
        label: "Delete",
        icon: <DeleteIcon />,
        danger: true,
        onClick: () => alert("Delete"),
      },
    ]

    return (
      <div className="w-full max-w-2xl overflow-x-auto">
        <table className="w-full rounded-lg border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {["Project Alpha", "Project Beta", "Project Gamma"].map((name, i) => (
              <tr key={i} className="border-t border-gray-200">
                <td className="px-4 py-3">{name}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Active</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu
                    trigger={
                      <IconButton size="sm" variant="plain" aria-label="Actions">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="19" cy="12" r="1" />
                          <circle cx="5" cy="12" r="1" />
                        </svg>
                      </IconButton>
                    }
                    items={items}
                    position="bottom-end"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  },
}
