import type { Meta, StoryObj } from "@storybook/react"
import { UserProfile } from "./UserProfile"

const meta: Meta<typeof UserProfile> = {
  title: "Components/UserProfile",
  component: UserProfile,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["card", "inline", "compact", "detailed"],
      description: "Visual variant of the profile",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl"],
      description: "Size of the profile",
    },
    status: {
      control: "select",
      options: ["online", "offline", "away", "busy"],
      description: "User status",
    },
    verified: {
      control: "boolean",
      description: "Show verified badge",
    },
    showActions: {
      control: "boolean",
      description: "Show action buttons",
    },
  },
}

export default meta
type Story = StoryObj<typeof UserProfile>

export const Default: Story = {
  args: {
    name: "Sarah Johnson",
    email: "sarah@example.com",
  },
}

export const WithAvatar: Story = {
  args: {
    name: "Alex Chen",
    username: "alexchen",
    email: "alex@example.com",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
    status: "online",
  },
}

export const Verified: Story = {
  args: {
    name: "Emily Rodriguez",
    username: "emilyrod",
    email: "emily@example.com",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
    status: "online",
    verified: true,
    bio: "Product Designer at Apple • Creating beautiful experiences",
  },
}

export const WithBio: Story = {
  args: {
    name: "Michael Thompson",
    username: "mikethompson",
    email: "michael@example.com",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
    status: "away",
    bio: "Software Engineer passionate about creating elegant solutions to complex problems. Love to code, travel, and coffee ☕",
  },
}

export const CardVariant: Story = {
  args: {
    variant: "card",
    name: "Jessica Williams",
    username: "jesswill",
    email: "jessica@example.com",
    avatarUrl: "https://i.pravatar.cc/150?img=9",
    status: "online",
    verified: true,
    bio: "UX Designer • Making the world more intuitive one interface at a time",
    followers: 1234,
    following: 567,
    posts: 89,
  },
}

export const DetailedVariant: Story = {
  args: {
    variant: "detailed",
    size: "lg",
    name: "David Martinez",
    username: "davidmartinez",
    email: "david@example.com",
    avatarUrl: "https://i.pravatar.cc/150?img=7",
    status: "online",
    verified: true,
    bio: "Creative Director & Brand Strategist. Helping companies build memorable brands that connect with people. 🎨",
    location: "San Francisco, CA",
    website: "https://davidmartinez.design",
    followers: 12500,
    following: 892,
    posts: 456,
    badges: [
      { label: "Pro Member", intent: "primary" },
      { label: "Early Adopter", intent: "success" },
    ],
    showActions: true,
    onMessage: () => console.log("Message clicked"),
    onCall: () => console.log("Call clicked"),
    onMore: () => console.log("More clicked"),
  },
}

export const CompactVariant: Story = {
  args: {
    variant: "compact",
    name: "Lisa Anderson",
    username: "lisaanderson",
    avatarUrl: "https://i.pravatar.cc/150?img=10",
    status: "busy",
  },
}

export const WithActions: Story = {
  args: {
    variant: "card",
    name: "Ryan Taylor",
    username: "ryantaylor",
    email: "ryan@example.com",
    avatarUrl: "https://i.pravatar.cc/150?img=13",
    status: "online",
    bio: "Frontend Developer • React & TypeScript enthusiast",
    showActions: true,
    onMessage: () => console.log("Message clicked"),
    onCall: () => console.log("Call clicked"),
  },
}

export const WithStats: Story = {
  args: {
    variant: "card",
    name: "Amanda Lee",
    username: "amandalee",
    email: "amanda@example.com",
    avatarUrl: "https://i.pravatar.cc/150?img=20",
    status: "online",
    verified: true,
    bio: "Content Creator • Sharing my journey in tech and design",
    followers: 45600,
    following: 1234,
    posts: 892,
  },
}

export const WithBadges: Story = {
  args: {
    variant: "card",
    name: "Chris Parker",
    username: "chrisparker",
    email: "chris@example.com",
    avatarUrl: "https://i.pravatar.cc/150?img=14",
    status: "online",
    verified: true,
    bio: "Full Stack Developer • Open Source Contributor",
    badges: [
      { label: "Contributor", intent: "primary" },
      { label: "Top 1%", intent: "success" },
      { label: "Mentor", intent: "secondary" },
    ],
  },
}

export const WithMetadata: Story = {
  args: {
    variant: "detailed",
    name: "Sophia Garcia",
    username: "sophiagarcia",
    email: "sophia@example.com",
    avatarUrl: "https://i.pravatar.cc/150?img=16",
    status: "online",
    verified: true,
    bio: "Marketing Director • Building brands that matter",
    metadata: [
      {
        label: "Location",
        value: "New York, NY",
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        ),
      },
      {
        label: "Joined",
        value: "March 2023",
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
          </svg>
        ),
      },
    ],
    followers: 8900,
    following: 432,
    showActions: true,
    onMessage: () => console.log("Message clicked"),
    onCall: () => console.log("Call clicked"),
    onMore: () => console.log("More clicked"),
  },
}

export const Clickable: Story = {
  args: {
    variant: "inline",
    name: "Tom Wilson",
    username: "tomwilson",
    email: "tom@example.com",
    avatarUrl: "https://i.pravatar.cc/150?img=17",
    status: "online",
    bio: "Backend Engineer • Scaling systems that matter",
    onClick: () => console.log("Profile clicked"),
  },
}

export const SmallSize: Story = {
  args: {
    size: "sm",
    name: "Emma Davis",
    username: "emmadavis",
    avatarUrl: "https://i.pravatar.cc/150?img=18",
    status: "online",
  },
}

export const LargeSize: Story = {
  args: {
    size: "lg",
    variant: "card",
    name: "James Brown",
    username: "jamesbrown",
    email: "james@example.com",
    avatarUrl: "https://i.pravatar.cc/150?img=19",
    status: "online",
    verified: true,
    bio: "Engineering Manager • Building high-performing teams",
  },
}

export const XLSize: Story = {
  args: {
    size: "xl",
    variant: "card",
    name: "Olivia Martinez",
    username: "oliviamartinez",
    email: "olivia@example.com",
    avatarUrl: "https://i.pravatar.cc/150?img=21",
    status: "online",
    verified: true,
    bio: "CEO & Founder • Building the future of work",
    followers: 125000,
    following: 892,
    showActions: true,
    onMessage: () => console.log("Message clicked"),
    onCall: () => console.log("Call clicked"),
  },
}

export const OfflineStatus: Story = {
  args: {
    variant: "card",
    name: "Noah Johnson",
    username: "noahjohnson",
    email: "noah@example.com",
    avatarUrl: "https://i.pravatar.cc/150?img=22",
    status: "offline",
    bio: "DevOps Engineer • Automating all the things",
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-neutral-900">Inline</h3>
        <UserProfile
          variant="inline"
          name="Sarah Johnson"
          username="sarahjohnson"
          email="sarah@example.com"
          avatarUrl="https://i.pravatar.cc/150?img=1"
          status="online"
          bio="Product Designer"
        />
      </div>
      <div>
        <h3 className="mb-4 text-lg font-semibold text-neutral-900">Compact</h3>
        <UserProfile
          variant="compact"
          name="Alex Chen"
          username="alexchen"
          avatarUrl="https://i.pravatar.cc/150?img=2"
          status="away"
        />
      </div>
      <div>
        <h3 className="mb-4 text-lg font-semibold text-neutral-900">Card</h3>
        <div className="max-w-md">
          <UserProfile
            variant="card"
            name="Emily Rodriguez"
            username="emilyrod"
            email="emily@example.com"
            avatarUrl="https://i.pravatar.cc/150?img=3"
            status="online"
            verified={true}
            bio="UX Designer • Making the world more intuitive"
            followers={1234}
            following={567}
            showActions={true}
            onMessage={() => console.log("Message")}
          />
        </div>
      </div>
      <div>
        <h3 className="mb-4 text-lg font-semibold text-neutral-900">Detailed</h3>
        <div className="max-w-lg">
          <UserProfile
            variant="detailed"
            name="Michael Thompson"
            username="mikethompson"
            email="michael@example.com"
            avatarUrl="https://i.pravatar.cc/150?img=4"
            status="online"
            verified={true}
            bio="Software Engineer passionate about creating elegant solutions"
            location="San Francisco, CA"
            website="https://michael.dev"
            followers={12500}
            following={892}
            posts={456}
            showActions={true}
            onMessage={() => console.log("Message")}
            onCall={() => console.log("Call")}
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
}
